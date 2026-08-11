const express = require('express');

const { protect } = require('../middleware/auth');
const {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const {
  createBookValidator,
  updateBookValidator,
} = require('../validators/bookValidator');

const router = express.Router();

router.use(protect);

router.get('/', getBooks);

router.post('/', createBookValidator, createBook);

router.put('/:id', updateBookValidator, updateBook);

router.delete('/:id', deleteBook);

module.exports = router;
