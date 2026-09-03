const router = require('express').Router();
const { getDashboard } = require('../../controllers/admin/dashboardController');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

router.use(authenticate, authorizeAdmin);
router.get('/', getDashboard);

module.exports = router;
