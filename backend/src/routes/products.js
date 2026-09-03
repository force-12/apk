const router = require('express').Router();
const { getProducts, getProduct, getFeaturedProducts, getLatestProducts, getBrands, getCategories } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/latest', getLatestProducts);
router.get('/brands', getBrands);
router.get('/categories', getCategories);
router.get('/:id', getProduct);

module.exports = router;
