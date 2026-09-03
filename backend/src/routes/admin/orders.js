const router = require('express').Router();
const { getOrders, getOrder, updateOrderStatus } = require('../../controllers/admin/orderController');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

router.use(authenticate, authorizeAdmin);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.put('/:id/status', updateOrderStatus);

module.exports = router;
