const router = require('express').Router();
const { createOrder, getOrders, getOrder } = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { checkoutValidation } = require('../middleware/validate');

router.use(authenticate);
router.post('/', checkoutValidation, createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);

module.exports = router;
