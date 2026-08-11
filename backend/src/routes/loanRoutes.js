const express = require('express');

const { protect } = require('../middleware/auth');
const {
  getLoans,
  createLoan,
  returnLoan,
} = require('../controllers/loanController');
const { createLoanValidator } = require('../validators/loanValidator');

const router = express.Router();

router.use(protect);

router.get('/', getLoans);

router.post('/', createLoanValidator, createLoan);

router.put('/:id/return', returnLoan);

module.exports = router;
