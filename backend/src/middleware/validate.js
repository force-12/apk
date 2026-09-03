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
  body('district').optional().trim(),
  body('postal_code').trim().notEmpty().withMessage('Kode pos wajib diisi.'),
  body('payment_method').isIn(['transfer_bank', 'e_wallet', 'cod']).withMessage('Metode pembayaran tidak valid.'),
  body('courier').trim().notEmpty().withMessage('Kurir wajib dipilih.')
];

const updateProfileValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi.')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter.')
    .isString().withMessage('Nama harus berupa teks.'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isMobilePhone('id-ID').withMessage('Nomor HP tidak valid.'),
  body('address')
    .optional({ values: 'falsy' })
    .trim()
    .isString().withMessage('Alamat harus berupa teks.')
    .isLength({ max: 500 }).withMessage('Alamat maksimal 500 karakter.'),
  body('province')
    .optional({ values: 'falsy' })
    .trim()
    .isString().withMessage('Provinsi harus berupa teks.')
    .isLength({ max: 100 }).withMessage('Provinsi maksimal 100 karakter.'),
  body('city')
    .optional({ values: 'falsy' })
    .trim()
    .isString().withMessage('Kota harus berupa teks.')
    .isLength({ max: 100 }).withMessage('Kota maksimal 100 karakter.'),
  body('district')
    .optional({ values: 'falsy' })
    .trim()
    .isString().withMessage('Kecamatan harus berupa teks.')
    .isLength({ max: 100 }).withMessage('Kecamatan maksimal 100 karakter.'),
  body('postal_code')
    .optional({ values: 'falsy' })
    .trim()
    .isString().withMessage('Kode pos harus berupa teks.')
    .isLength({ max: 10 }).withMessage('Kode pos maksimal 10 karakter.')
    .matches(/^[0-9]*$/).withMessage('Kode pos hanya boleh berisi angka.'),
  // Reject email and role from being sent
  body('email').not().exists().withMessage('Email tidak dapat diubah melalui endpoint ini.'),
  body('role').not().exists().withMessage('Role tidak dapat diubah melalui endpoint ini.')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Password lama wajib diisi.')
    .isString().withMessage('Password lama harus berupa teks.'),
  body('newPassword')
    .notEmpty().withMessage('Password baru wajib diisi.')
    .isString().withMessage('Password baru harus berupa teks.')
    .isLength({ min: 6 }).withMessage('Password baru minimal 6 karakter.')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Password baru tidak boleh sama dengan password lama.');
      }
      return true;
    })
];

const variantValidation = [
  body('price').isFloat({ min: 0 }).withMessage('Harga harus angka positif.'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stok harus angka bulat positif.'),
  body('ram').optional().isString().trim(),
  body('storage').optional().isString().trim(),
  body('color').optional().isString().trim()
];

module.exports = { loginValidation, registerValidation, productValidation, checkoutValidation, updateProfileValidation, changePasswordValidation, variantValidation };
