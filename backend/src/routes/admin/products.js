const router = require('express').Router();
const { getProducts, createProduct, updateProduct, deleteProduct, addVariant, updateVariant, deleteVariant } = require('../../controllers/admin/productController');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const { productValidation, variantValidation } = require('../../middleware/validate');

router.use(authenticate, authorizeAdmin);
router.get('/', getProducts);
router.post('/', upload.single('image'), productValidation, createProduct);
router.put('/:id', upload.single('image'), productValidation, updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/variants', variantValidation, addVariant);
router.put('/variants/:id', variantValidation, updateVariant);
router.delete('/variants/:id', deleteVariant);

module.exports = router;
