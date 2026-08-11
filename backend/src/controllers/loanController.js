const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Loan = require('../models/Loan');
const Member = require('../models/Member');
const Book = require('../models/Book');

const loanPopulate = [
  { path: 'member', select: 'name email phone' },
  { path: 'book', select: 'title author isbn category' },
];

function handleValidationErrors(req, res) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return null;
  }

  return res.status(422).json({
    success: false,
    message: 'Data peminjaman yang dikirim belum valid.',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

async function getLoans(req, res, next) {
  try {
    const loans = await Loan.find()
      .populate(loanPopulate)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: loans,
    });
  } catch (error) {
    return next(error);
  }
}

async function createLoan(req, res, next) {
  const validationResponse = handleValidationErrors(req, res);

  if (validationResponse) {
    return validationResponse;
  }

  try {
    const { member, book } = req.body;
    const dueDate = new Date(req.body.dueDate);

    if (!mongoose.isValidObjectId(member)) {
      return res.status(400).json({
        success: false,
        message: 'ID anggota tidak valid.',
      });
    }

    if (!mongoose.isValidObjectId(book)) {
      return res.status(400).json({
        success: false,
        message: 'ID buku tidak valid.',
      });
    }

    const memberData = await Member.findById(member);

    if (!memberData) {
      return res.status(404).json({
        success: false,
        message: 'Data anggota tidak ditemukan.',
      });
    }

    const bookData = await Book.findById(book);

    if (!bookData) {
      return res.status(404).json({
        success: false,
        message: 'Data buku tidak ditemukan.',
      });
    }

    if (bookData.availableStock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Buku tidak tersedia untuk dipinjam.',
      });
    }

    const activeLoan = await Loan.findOne({
      member,
      book,
      status: 'borrowed',
    });

    if (activeLoan) {
      return res.status(409).json({
        success: false,
        message: 'Anggota masih memiliki peminjaman aktif untuk buku ini.',
      });
    }

    if (Number.isNaN(dueDate.getTime()) || dueDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal jatuh tempo harus setelah tanggal peminjaman.',
      });
    }

    const loan = await Loan.create({
      member,
      book,
      dueDate,
      status: 'borrowed',
    });

    bookData.availableStock -= 1;
    await bookData.save();

    const populatedLoan = await Loan.findById(loan._id).populate(loanPopulate);

    return res.status(201).json({
      success: true,
      message: 'Transaksi peminjaman berhasil dicatat.',
      data: populatedLoan,
    });
  } catch (error) {
    return next(error);
  }
}

async function returnLoan(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID peminjaman tidak valid.',
      });
    }

    const loan = await Loan.findById(id).populate(loanPopulate);

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: 'Data peminjaman tidak ditemukan.',
      });
    }

    if (loan.status === 'returned') {
      return res.status(409).json({
        success: false,
        message: 'Buku pada transaksi ini sudah dikembalikan.',
      });
    }

    const bookId = loan.book && loan.book._id ? loan.book._id : loan.book;
    const bookData = await Book.findById(bookId);

    if (!bookData) {
      return res.status(404).json({
        success: false,
        message: 'Data buku pada transaksi peminjaman tidak ditemukan.',
      });
    }

    loan.status = 'returned';
    loan.returnDate = new Date();

    await loan.save();

    bookData.availableStock = Math.min(bookData.stock, bookData.availableStock + 1);
    await bookData.save();

    const populatedLoan = await Loan.findById(loan._id).populate(loanPopulate);

    return res.status(200).json({
      success: true,
      message: 'Buku berhasil dikembalikan.',
      data: populatedLoan,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getLoans,
  createLoan,
  returnLoan,
};
