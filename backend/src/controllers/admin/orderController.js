const db = require('../../config/database');

const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT o.*, u.name as customer_name, u.email as customer_email
                 FROM orders o JOIN users u ON o.user_id = u.id WHERE 1=1`;
    let countQuery = 'SELECT COUNT(*) as total FROM orders o WHERE 1=1';
    const params = [];
    const countParams = [];

    if (status) {
      query += ' AND o.status = ?';
      countQuery += ' AND o.status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (search) {
      query += ' AND (o.order_number LIKE ? OR u.name LIKE ?)';
      countQuery += ' AND (o.order_number LIKE ? OR o.user_id IN (SELECT id FROM users WHERE name LIKE ?))';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [orders] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

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
      `SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
       FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [id]
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

    const [payments] = await db.query('SELECT * FROM payments WHERE order_id = ?', [id]);

    res.json({
      order: { ...orders[0], items, payment: payments[0] || null }
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { status } = req.body;

    // Valid status transition map
    const validTransitions = {
      pending: ['processing', 'cancelled'],
      processing: ['packed', 'cancelled'],
      packed: ['shipped', 'cancelled'],
      shipped: ['completed'],
      completed: [],
      cancelled: []
    };

    const validStatuses = ['pending', 'processing', 'packed', 'shipped', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      await connection.rollback();
      return res.status(400).json({ message: 'Status tidak valid.' });
    }

    // Get current order status with row lock
    const [orders] = await connection.query(
      'SELECT id, status FROM orders WHERE id = ? FOR UPDATE',
      [id]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pesanan tidak ditemukan.' });
    }

    const currentStatus = orders[0].status;

    // Idempotency check - if already the same status, return success
    if (currentStatus === status) {
      await connection.rollback();
      return res.json({ message: 'Status pesanan sudah sesuai.' });
    }

    // Validate status transition
    const allowedNextStatuses = validTransitions[currentStatus];
    if (!allowedNextStatuses || !allowedNextStatuses.includes(status)) {
      await connection.rollback();
      return res.status(400).json({
        message: `Tidak dapat mengubah status dari "${currentStatus}" ke "${status}".`
      });
    }

    // Update order status
    await connection.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // Update payment status if order completed
    if (status === 'completed') {
      await connection.query(
        'UPDATE payments SET payment_status = ?, paid_at = NOW() WHERE order_id = ?',
        ['paid', id]
      );
    }

    // If cancelled, restore stock within the same transaction
    if (status === 'cancelled') {
      const [items] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        await connection.query(
          'UPDATE products SET stock = stock + ?, sold = GREATEST(sold - ?, 0) WHERE id = ?',
          [item.quantity, item.quantity, item.product_id]
        );
        if (item.variant_id) {
          await connection.query(
            'UPDATE product_variants SET stock = stock + ? WHERE id = ?',
            [item.quantity, item.variant_id]
          );
        }
      }
      await connection.query(
        "UPDATE payments SET payment_status = 'failed' WHERE order_id = ?",
        [id]
      );
    }

    await connection.commit();

    res.json({ message: 'Status pesanan berhasil diperbarui.' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = { getOrders, getOrder, updateOrderStatus };
