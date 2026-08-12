const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nama wajib diisi.')
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage('Nama harus terdiri dari 3-50 karakter.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Format email tidak valid.')
    .bail()
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password harus berupa teks.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password minimal 8 karakter.')
    .bail()
    .matches(/[a-z]/)
    .withMessage('Password harus memiliki huruf kecil.')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('Password harus memiliki huruf besar.')
    .bail()
    .matches(/[0-9]/)
    .withMessage('Password harus memiliki angka.'),
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Format email tidak valid.')
    .bail()
    .normalizeEmail(),
  body('password')
    .isString()
    .withMessage('Password harus berupa teks.')
    .bail()
    .notEmpty()
    .withMessage('Password wajib diisi.'),
];

const changePasswordValidator = [
  body('currentPassword')
    .isString()
    .withMessage('Password saat ini wajib diisi.')
    .bail()
    .notEmpty()
    .withMessage('Password saat ini wajib diisi.'),
  body('newPassword')
    .isString()
    .withMessage('Password baru wajib diisi.')
    .bail()
    .isLength({ min: 8 })
    .withMessage('Password baru minimal 8 karakter.')
    .bail()
    .matches(/[a-z]/)
    .withMessage('Password baru harus memiliki huruf kecil.')
    .bail()
    .matches(/[A-Z]/)
    .withMessage('Password baru harus memiliki huruf besar.')
    .bail()
    .matches(/[0-9]/)
    .withMessage('Password baru harus memiliki angka.'),
  body('confirmPassword')
    .isString()
    .withMessage('Konfirmasi password wajib diisi.')
    .bail()
    .notEmpty()
    .withMessage('Konfirmasi password wajib diisi.')
    .bail()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Konfirmasi password tidak sama dengan password baru.'),
];

module.exports = {
  registerValidator,
  loginValidator,
  changePasswordValidator,
};
