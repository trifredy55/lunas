const { body } = require('express-validator');

const createLoanValidator = [
  body('member')
    .notEmpty()
    .withMessage('ID anggota wajib diisi.')
    .bail()
    .isMongoId()
    .withMessage('ID anggota tidak valid.'),
  body('book')
    .notEmpty()
    .withMessage('ID buku wajib diisi.')
    .bail()
    .isMongoId()
    .withMessage('ID buku tidak valid.'),
  body('dueDate')
    .notEmpty()
    .withMessage('Tanggal jatuh tempo wajib diisi.')
    .bail()
    .isISO8601()
    .withMessage('Tanggal jatuh tempo tidak valid.')
    .bail()
    .custom((value) => new Date(value).getTime() > Date.now())
    .withMessage('Jatuh tempo harus setelah tanggal peminjaman.')
    .toDate(),
];

module.exports = {
  createLoanValidator,
};
