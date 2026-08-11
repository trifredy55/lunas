const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Book = require('../models/Book');

function handleValidationErrors(req, res) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return null;
  }

  return res.status(422).json({
    success: false,
    message: 'Data buku yang dikirim belum valid.',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

async function getBooks(req, res, next) {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: books,
    });
  } catch (error) {
    return next(error);
  }
}

async function createBook(req, res, next) {
  const validationResponse = handleValidationErrors(req, res);

  if (validationResponse) {
    return validationResponse;
  }

  try {
    const { title, author, category, isbn, stock } = req.body;

    const existingBook = await Book.findOne({ isbn });

    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: 'ISBN sudah terdaftar.',
      });
    }

    const book = await Book.create({
      title,
      author,
      category,
      isbn,
      stock,
      availableStock: stock,
    });

    return res.status(201).json({
      success: true,
      message: 'Data buku berhasil ditambahkan.',
      data: book,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.isbn) {
      return res.status(409).json({
        success: false,
        message: 'ISBN sudah terdaftar.',
      });
    }

    return next(error);
  }
}

async function updateBook(req, res, next) {
  const validationResponse = handleValidationErrors(req, res);

  if (validationResponse) {
    return validationResponse;
  }

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID buku tidak valid.',
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Data buku tidak ditemukan.',
      });
    }

    const updates = {};
    const allowedFields = ['title', 'author', 'category', 'isbn'];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (
      Object.prototype.hasOwnProperty.call(req.body, 'isbn') &&
      req.body.isbn !== book.isbn
    ) {
      const duplicateIsbn = await Book.findOne({
        isbn: req.body.isbn,
        _id: { $ne: book._id },
      });

      if (duplicateIsbn) {
        return res.status(409).json({
          success: false,
          message: 'ISBN sudah digunakan oleh buku lain.',
        });
      }
    }

    Object.assign(book, updates);

    if (Object.prototype.hasOwnProperty.call(req.body, 'stock')) {
      const borrowedCount = book.stock - book.availableStock;
      const newStock = req.body.stock;

      if (newStock < borrowedCount) {
        return res.status(400).json({
          success: false,
          message:
            'Stok baru tidak boleh lebih kecil dari jumlah buku yang sedang dipinjam.',
        });
      }

      book.stock = newStock;
      book.availableStock = newStock - borrowedCount;
    }

    await book.save();

    return res.status(200).json({
      success: true,
      message: 'Data buku berhasil diperbarui.',
      data: book,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.isbn) {
      return res.status(409).json({
        success: false,
        message: 'ISBN sudah digunakan oleh buku lain.',
      });
    }

    return next(error);
  }
}

async function deleteBook(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID buku tidak valid.',
      });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Data buku tidak ditemukan.',
      });
    }

    await book.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Data buku berhasil dihapus.',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
};
