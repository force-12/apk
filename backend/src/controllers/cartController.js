const db = require('../config/database');

const getCart = async (req, res, next) => {
  try {
    // Get or create cart
    let [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    if (carts.length === 0) {
      const [result] = await db.query('INSERT INTO cart (user_id) VALUES (?)', [req.user.id]);
      carts = [{ id: result.insertId }];
    }
    const cartId = carts[0].id;

    const [items] = await db.query(
      `SELECT ci.*, p.name as product_name, p.image as product_image, p.price as product_price,
              p.discount as product_discount, p.stock as product_stock,
              b.name as brand_name,
              pv.ram, pv.storage, pv.color, pv.price as variant_price, pv.stock as variant_stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_variants pv ON ci.variant_id = pv.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    const cartItems = items.map(item => {
      const price = item.variant_price || item.product_price;
      const discount = item.product_discount || 0;
      const finalPrice = price - (price * discount / 100);
      return {
        ...item,
        price: finalPrice,
        original_price: price,
        subtotal: finalPrice * item.quantity
      };
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      cart_id: cartId,
      items: cartItems,
      subtotal,
      total_items: cartItems.length
    });
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const { product_id, variant_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID wajib diisi.' });
    }

    // Check product exists
    const [products] = await db.query('SELECT id, stock FROM products WHERE id = ? AND is_active = 1', [product_id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan.' });
    }

    // Get or create cart
    let [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    if (carts.length === 0) {
      const [result] = await db.query('INSERT INTO cart (user_id) VALUES (?)', [req.user.id]);
      carts = [{ id: result.insertId }];
    }
    const cartId = carts[0].id;

    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))',
      [cartId, product_id, variant_id || null, variant_id || null]
    );

    if (existing.length > 0) {
      await db.query('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
    } else {
      await db.query(
        'INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
        [cartId, product_id, variant_id || null, quantity]
      );
    }

    res.json({ message: 'Produk berhasil ditambahkan ke keranjang.' });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantity minimal 1.' });
    }

    const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan.' });
    }

    const [result] = await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?',
      [quantity, id, carts[0].id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan.' });
    }

    res.json({ message: 'Quantity berhasil diperbarui.' });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    if (carts.length === 0) {
      return res.status(404).json({ message: 'Keranjang tidak ditemukan.' });
    }

    await db.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [id, carts[0].id]);

    res.json({ message: 'Item berhasil dihapus dari keranjang.' });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const [carts] = await db.query('SELECT id FROM cart WHERE user_id = ?', [req.user.id]);
    if (carts.length > 0) {
      await db.query('DELETE FROM cart_items WHERE cart_id = ?', [carts[0].id]);
    }
    res.json({ message: 'Keranjang berhasil dikosongkan.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };
