const router = require('express').Router();
const { getSalesReport, exportExcel, exportPDF } = require('../../controllers/admin/reportController');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

router.use(authenticate, authorizeAdmin);
router.get('/sales', getSalesReport);
router.get('/export/excel', exportExcel);
router.get('/export/pdf', exportPDF);

module.exports = router;
