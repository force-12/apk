const db = require('../../config/database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { formatCurrency } = require('../../utils/helpers');

const getSalesReport = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = " AND DATE(o.created_at) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = " AND DATE(o.created_at) >= ?";
      params.push(start_date);
    } else if (end_date) {
      dateFilter = " AND DATE(o.created_at) <= ?";
      params.push(end_date);
    }

    // Total transactions and revenue
    const [summary] = await db.query(
      `SELECT COUNT(*) as total_transactions,
              COALESCE(SUM(total), 0) as total_revenue,
              COALESCE(AVG(total), 0) as avg_order_value
       FROM orders o
       WHERE status != 'cancelled'${dateFilter}`,
      params
    );

    // Top selling products
    const [topProducts] = await db.query(
      `SELECT p.id, p.name, b.name as brand_name, p.price,
              SUM(oi.quantity) as total_sold,
              SUM(oi.subtotal) as total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       LEFT JOIN brands b ON p.brand_id = b.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'${dateFilter}
       GROUP BY p.id ORDER BY total_sold DESC LIMIT 10`,
      params
    );

    // Top selling brands
    const [topBrands] = await db.query(
      `SELECT b.name, SUM(oi.quantity) as total_sold,
              SUM(oi.subtotal) as total_revenue
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       JOIN brands b ON p.brand_id = b.id
       JOIN orders o ON oi.order_id = o.id
       WHERE o.status != 'cancelled'${dateFilter}
       GROUP BY b.id ORDER BY total_sold DESC LIMIT 10`,
      params
    );

    // Daily revenue for chart
    const [dailyRevenue] = await db.query(
      `SELECT DATE(o.created_at) as date,
              SUM(o.total) as revenue,
              COUNT(*) as orders
       FROM orders o
       WHERE o.status != 'cancelled'${dateFilter}
       GROUP BY DATE(o.created_at) ORDER BY date ASC`,
      params
    );

    res.json({
      summary: summary[0],
      topProducts,
      topBrands,
      dailyRevenue
    });
  } catch (error) {
    next(error);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = " AND DATE(o.created_at) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    const [orders] = await db.query(
      `SELECT o.order_number, o.created_at, u.name as customer_name,
              o.total, o.payment_method, o.status
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE o.status != 'cancelled'${dateFilter}
       ORDER BY o.created_at DESC`,
      params
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Penjualan');

    worksheet.columns = [
      { header: 'No. Pesanan', key: 'order_number', width: 25 },
      { header: 'Tanggal', key: 'created_at', width: 20 },
      { header: 'Customer', key: 'customer_name', width: 25 },
      { header: 'Total', key: 'total', width: 20 },
      { header: 'Pembayaran', key: 'payment_method', width: 18 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };

    orders.forEach(order => {
      worksheet.addRow({
        ...order,
        created_at: new Date(order.created_at).toLocaleDateString('id-ID'),
        total: formatCurrency(order.total)
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan-penjualan.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

const exportPDF = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    let dateFilter = '';
    const params = [];

    if (start_date && end_date) {
      dateFilter = " AND DATE(o.created_at) BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    const [summary] = await db.query(
      `SELECT COUNT(*) as total_transactions, COALESCE(SUM(total), 0) as total_revenue
       FROM orders o WHERE status != 'cancelled'${dateFilter}`,
      params
    );

    const [orders] = await db.query(
      `SELECT o.order_number, o.created_at, u.name as customer_name,
              o.total, o.payment_method, o.status
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE o.status != 'cancelled'${dateFilter}
       ORDER BY o.created_at DESC LIMIT 50`,
      params
    );

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan-penjualan.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Laporan Penjualan', { align: 'center' });
    doc.fontSize(12).text('SmartPhone Store', { align: 'center' });
    doc.moveDown();

    if (start_date && end_date) {
      doc.fontSize(10).text(`Periode: ${start_date} - ${end_date}`, { align: 'center' });
    }
    doc.moveDown();

    doc.fontSize(12).text(`Total Transaksi: ${summary[0].total_transactions}`);
    doc.text(`Total Pendapatan: ${formatCurrency(summary[0].total_revenue)}`);
    doc.moveDown();

    doc.fontSize(14).text('Daftar Pesanan', { underline: true });
    doc.moveDown(0.5);

    orders.forEach((order, i) => {
      doc.fontSize(9).text(
        `${i + 1}. ${order.order_number} | ${new Date(order.created_at).toLocaleDateString('id-ID')} | ${order.customer_name} | ${formatCurrency(order.total)} | ${order.status}`
      );
    });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = { getSalesReport, exportExcel, exportPDF };
