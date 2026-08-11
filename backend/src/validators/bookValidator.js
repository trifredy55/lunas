const { body } = require('express-validator');

const createBookValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Judul buku wajib diisi.')
    .bail()
    .isLength({ max: 200 })
    .withMessage('Judul buku maksimal 200 karakter.'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Penulis wajib diisi.')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Penulis maksimal 100 karakter.'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Kategori wajib diisi.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Kategori maksimal 50 karakter.'),
  body('isbn')
    .trim()
    .notEmpty()
    .withMessage('ISBN wajib diisi.')
    .bail()
    .isLength({ max: 30 })
    .withMessage('ISBN maksimal 30 karakter.'),
  body('stock')
    .exists()
    .withMessage('Stok wajib diisi.')
    .bail()
    .isInt({ min: 0 })
    .withMessage('Stok harus berupa bilangan bulat minimal 0.')
    .toInt(),
];

const updateBookValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Judul buku wajib diisi.')
    .bail()
    .isLength({ max: 200 })
    .withMessage('Judul buku maksimal 200 karakter.'),
  body('author')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Penulis wajib diisi.')
    .bail()
    .isLength({ max: 100 })
    .withMessage('Penulis maksimal 100 karakter.'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Kategori wajib diisi.')
    .bail()
    .isLength({ max: 50 })
    .withMessage('Kategori maksimal 50 karakter.'),
  body('isbn')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('ISBN wajib diisi.')
    .bail()
    .isLength({ max: 30 })
    .withMessage('ISBN maksimal 30 karakter.'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stok harus berupa bilangan bulat minimal 0.')
    .toInt(),
];

module.exports = {
  createBookValidator,
  updateBookValidator,
};
