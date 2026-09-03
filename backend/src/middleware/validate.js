const { body, param, query } = require('express-validator');

const loginValidation = [
  body('email').isEmail().withMessage('Email tidak valid.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password wajib diisi.')
];

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nama wajib diisi.').isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter.'),
  body('email').isEmail().withMessage('Email tidak valid.').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter.'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password tidak cocok.');
    }
    return true;
  }),
  body('phone').optional().isMobilePhone('id-ID').withMessage('Nomor HP tidak valid.')
];

const productValidation = [
  body('name').trim().notEmpty().withMessage('Nama produk wajib diisi.'),
  body('brand_id').isInt({ min: 1 }).withMessage('Brand wajib dipilih.'),
  body('price').isFloat({ min: 0 }).withMessage('Harga harus angka positif.'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stok harus angka positif.'),
  body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Diskon harus 0-100.')
];

const checkoutValidation = [
  body('recipient_name').trim().notEmpty().withMessage('Nama penerima wajib diisi.'),
  body('recipient_phone').trim().notEmpty().withMessage('Nomor HP penerima wajib diisi.'),
  body('shipping_address').trim().notEmpty().withMessage('Alamat wajib diisi.'),
  body('province').trim().notEmpty().withMessage('Provinsi wajib diisi.'),
  body('city').trim().notEmpty().withMessage('Kota wajib diisi.'),
  body('postal_code').trim().notEmpty().withMessage('Kode pos wajib diisi.'),
  body('payment_method').isIn(['transfer_bank', 'e_wallet', 'cod']).withMessage('Metode pembayaran tidak valid.'),
  body('courier').trim().notEmpty().withMessage('Kurir wajib dipilih.')
];

module.exports = { loginValidation, registerValidation, productValidation, checkoutValidation };
