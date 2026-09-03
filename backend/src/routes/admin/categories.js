const router = require('express').Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../../controllers/admin/categoryController');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

router.use(authenticate, authorizeAdmin);
router.get('/', getCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
