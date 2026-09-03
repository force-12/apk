const db = require('../config/database');
const { generateOrderNumber } = require('../utils/helpers');
const { validationResult } = require('express-validator');

const createOrder = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    // Check validation result from checkoutValidation middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    await connection.beginTransaction();

    const {
      recipient_name, recipient_phone, shipping_address,
      province, city, district, postal_code,
      courier, payment_method, notes
    } = req.body;

    // Get cart items
    const [carts] = await connection.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    if (carts.length === 0) {
      return res.status(400).json({ message: 'Keranjang kosong.' });
    }

    const [cartItems] = await connection.query(
      `SELECT ci.*, p.price as product_price, p.discount as product_discount, p.stock as product_stock, p.name as product_name,
              pv.price as variant_price, pv.stock as variant_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.cart_id = ?`,
      [carts[0].id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Keranjang kosong.' });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const price = item.variant_price || item.product_price;
      const discount = item.product_discount || 0;
      const finalPrice = price - (price * discount / 100);
      const itemSubtotal = finalPrice * item.quantity;
      subtotal += itemSubtotal;

      // Check stock
      const stock = item.variant_id ? item.variant_stock : item.product_stock;
      if (item.quantity > stock) {
        await connection.rollback();
        return res.status(400).json({ message: `Stok ${item.product_name} tidak mencukupi.` });
      }

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: finalPrice,
        subtotal: itemSubtotal
      });
    }

    const shippingCost = 15000;
    const orderDiscount = 0;
    const total = subtotal + shippingCost - orderDiscount;
    const orderNumber = generateOrderNumber();

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, order_number, subtotal, shipping_cost, discount, total, payment_method, status, 
       recipient_name, recipient_phone, shipping_address, province, city, district, postal_code, courier, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, orderNumber, subtotal, shippingCost, orderDiscount, total, payment_method,
       recipient_name, recipient_phone, shipping_address, province, city, district || '', postal_code, courier, notes || '']
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of orderItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.variant_id, item.quantity, item.price, item.subtotal]
      );

      // Update product stock and sold
      await connection.query(
        'UPDATE products SET stock = stock - ?, sold = sold + ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      );

      if (item.variant_id) {
        await connection.query(
          'UPDATE product_variants SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      }
    }

    // Create payment record
    await connection.query(
      'INSERT INTO payments (order_id, payment_method, payment_status, amount) VALUES (?, ?, ?, ?)',
      [orderId, payment_method, payment_method === 'cod' ? 'pending' : 'pending', total]
    );

    // Clear cart
    await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);

    await connection.commit();

    res.status(201).json({
      message: 'Pesanan berhasil dibuat.',
      order: {
        id: orderId,
        order_number: orderNumber,
        total,
        status: 'pending',
        payment_method
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT o.*, 
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o WHERE o.user_id = ?`;
    let countQuery = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const params = [req.user.id];
    const countParams = [req.user.id];

    if (status) {
      query += ' AND o.status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [orders] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    // Get first item for each order for preview
    for (const order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name as product_name, p.image as product_image, b.name as brand_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN brands b ON p.brand_id = b.id
         WHERE oi.order_id = ?
         LIMIT 2`,
        [order.id]
      );
      order.items_preview = items;
    }

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    const [items] = await db.query(
      `SELECT oi.*, p.name as product_name, p.image as product_image,
              b.name as brand_name, pv.ram, pv.storage, pv.color
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_variants pv ON oi.variant_id = pv.id
       WHERE oi.order_id = ?`,
      [id]
    );

    const [payments] = await db.query(
      'SELECT * FROM payments WHERE order_id = ?',
      [id]
    );

    res.json({
      order: { ...orders[0], items, payment: payments[0] || null }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrder };
