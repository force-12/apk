const router = require('express').Router();
const { getCustomers, getCustomer, toggleCustomerStatus } = require('../../controllers/admin/customerController');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

router.use(authenticate, authorizeAdmin);
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id/toggle', toggleCustomerStatus);

module.exports = router;
