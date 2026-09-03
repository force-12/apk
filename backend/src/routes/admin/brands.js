const router = require('express').Router();
const { getBrands, createBrand, updateBrand, deleteBrand } = require('../../controllers/admin/brandController');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

router.use(authenticate, authorizeAdmin);
router.get('/', getBrands);
router.post('/', createBrand);
router.put('/:id', updateBrand);
router.delete('/:id', deleteBrand);

module.exports = router;
