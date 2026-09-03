const router = require('express').Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginValidation, registerValidation, updateProfileValidation, changePasswordValidation } = require('../middleware/validate');

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

module.exports = router;
