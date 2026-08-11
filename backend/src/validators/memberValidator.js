const { body } = require('express-validator');

const createMemberValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nama anggota wajib diisi.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama anggota harus terdiri dari 3-100 karakter.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Format email anggota tidak valid.')
    .bail()
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Nomor telepon wajib diisi.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('Nomor telepon maksimal 20 karakter.'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Alamat anggota wajib diisi.')
    .bail()
    .isLength({ max: 255 })
    .withMessage('Alamat anggota maksimal 255 karakter.'),
];

const updateMemberValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nama anggota wajib diisi.')
    .bail()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama anggota harus terdiri dari 3-100 karakter.'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Format email anggota tidak valid.')
    .bail()
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Nomor telepon wajib diisi.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('Nomor telepon maksimal 20 karakter.'),
  body('address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Alamat anggota wajib diisi.')
    .bail()
    .isLength({ max: 255 })
    .withMessage('Alamat anggota maksimal 255 karakter.'),
];

module.exports = {
  createMemberValidator,
  updateMemberValidator,
};
