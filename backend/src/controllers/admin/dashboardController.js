const db = require('../../config/database');

const getDashboard = async (req, res, next) => {
  try {
    const [totalProducts] = await db.query('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    const [totalOrders] = await db.query('SELECT COUNT(*) as count FROM orders');
    const [totalCustomers] = await db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const [totalRevenue] = await db.query("SELECT COALESCE(SUM(total), 0) as total FROM orders WHERE status != 'cancelled'");

    const [todayOrders] = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()'
    );

    const [topProducts] = await db.query(
      `SELECT p.id, p.name, p.image, p.sold, p.price, b.name as brand_name
       FROM products p LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.is_active = 1 ORDER BY p.sold DESC LIMIT 5`
    );

    const [monthlyRevenue] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as month,
        DATE_FORMAT(MIN(created_at), '%b %Y') as label,
        SUM(total) as revenue, COUNT(*) as orders
       FROM orders WHERE status != 'cancelled'
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month ASC`
    );

    const [ordersByStatus] = await db.query(
      'SELECT status, COUNT(*) as count FROM orders GROUP BY status'
    );

    const [recentOrders] = await db.query(
      `SELECT o.*, u.name as customer_name FROM orders o
       JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 10`
    );

    res.json({
      stats: {
        totalProducts: totalProducts[0].count,
        totalOrders: totalOrders[0].count,
        totalCustomers: totalCustomers[0].count,
        totalRevenue: totalRevenue[0].total,
        todayOrders: todayOrders[0].count
      },
      topProducts, monthlyRevenue, ordersByStatus, recentOrders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
