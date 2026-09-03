const db = require('../../config/database');

const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT u.id, u.name, u.email, u.phone, u.is_active, u.created_at,
                 COUNT(DISTINCT o.id) as order_count,
                 COALESCE(SUM(o.total), 0) as total_spent
                 FROM users u
                 LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
                 WHERE u.role = 'customer'`;
    let countQuery = "SELECT COUNT(*) as total FROM users WHERE role = 'customer'";
    const params = [];
    const countParams = [];

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [customers] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    res.json({
      customers,
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

const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [users] = await db.query(
      `SELECT id, name, email, phone, address, province, city, district, postal_code, is_active, created_at
       FROM users WHERE id = ? AND role = 'customer'`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'Customer tidak ditemukan.' });
    }

    const [orderStats] = await db.query(
      `SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_spent
       FROM orders WHERE user_id = ? AND status != 'cancelled'`,
      [id]
    );

    const [recentOrders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [id]
    );

    res.json({
      customer: {
        ...users[0],
        total_orders: orderStats[0].total_orders,
        total_spent: orderStats[0].total_spent,
        recent_orders: recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

const toggleCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [users] = await db.query('SELECT is_active FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Customer tidak ditemukan.' });
    }

    const newStatus = !users[0].is_active;
    await db.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    res.json({
      message: newStatus ? 'Akun berhasil diaktifkan.' : 'Akun berhasil dinonaktifkan.',
      is_active: newStatus
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCustomers, getCustomer, toggleCustomerStatus };
