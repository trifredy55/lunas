const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '..', '.env'),
  quiet: true,
});

const mongoose = require('mongoose');

const Book = require('../src/models/Book');
const Loan = require('../src/models/Loan');

const CUTOFF_DATE = new Date('2026-08-12T23:59:59.999+07:00');

function formatSummaryLine(label, value) {
  return `${label.padEnd(28, ' ')}: ${value}`;
}

function formatJakartaDate(date) {
  if (!date) {
    return '-';
  }

  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return `${formatter.format(date)} WIB`;
}

async function findFutureLoans() {
  return Loan.find({
    loanDate: { $gt: CUTOFF_DATE },
  })
    .populate('member', 'name')
    .populate('book', 'title')
    .sort({ loanDate: 1 })
    .lean();
}

function printFutureLoanPreview(loans) {
  console.log(`Jumlah transaksi masa depan ditemukan: ${loans.length}`);

  loans.forEach((loan) => {
    console.log(
      `- Member: ${loan.member?.name || '-'} | Buku: ${loan.book?.title || '-'} | Loan Date: ${formatJakartaDate(
        loan.loanDate
      )} | Status: ${loan.status}`
    );
  });
}

async function deleteFutureLoans(loans) {
  if (loans.length === 0) {
    return 0;
  }

  const result = await Loan.deleteMany({
    _id: { $in: loans.map((loan) => loan._id) },
  });

  return result.deletedCount || 0;
}

async function recalculateAvailableStock() {
  const borrowedCounts = await Loan.aggregate([
    {
      $match: {
        status: 'borrowed',
      },
    },
    {
      $group: {
        _id: '$book',
        total: { $sum: 1 },
      },
    },
  ]);

  const borrowedMap = new Map(
    borrowedCounts.map((item) => [item._id.toString(), item.total])
  );
  const books = await Book.find().select('_id stock').lean();

  const operations = books.map((book) => {
    const borrowedCount = borrowedMap.get(book._id.toString()) || 0;
    const availableStock = book.stock - borrowedCount;

    if (availableStock < 0 || availableStock > book.stock) {
      throw new Error(
        `availableStock tidak valid untuk buku dengan ID ${book._id.toString()}.`
      );
    }

    return {
      updateOne: {
        filter: { _id: book._id },
        update: {
          $set: {
            availableStock,
          },
        },
      },
    };
  });

  if (operations.length > 0) {
    await Book.bulkWrite(operations);
  }

  return books.length;
}

async function validateCleanup() {
  const remainingFutureLoans = await Loan.countDocuments({
    loanDate: { $gt: CUTOFF_DATE },
  });

  if (remainingFutureLoans > 0) {
    throw new Error('Masih terdapat transaksi peminjaman dengan loanDate di masa depan.');
  }

  const invalidStocks = await Book.countDocuments({
    $expr: {
      $or: [
        { $lt: ['$availableStock', 0] },
        { $gt: ['$availableStock', '$stock'] },
      ],
    },
  });

  if (invalidStocks > 0) {
    throw new Error('Masih terdapat buku dengan availableStock di luar batas yang valid.');
  }

  const loans = await Loan.find().populate('member', '_id').populate('book', '_id').lean();
  const hasBrokenReference = loans.some((loan) => !loan.member || !loan.book);

  if (hasBrokenReference) {
    throw new Error('Masih terdapat transaksi peminjaman dengan referensi Member atau Book tidak valid.');
  }
}

async function getMaximumLoanDate() {
  const latestLoan = await Loan.findOne().sort({ loanDate: -1 }).select('loanDate').lean();

  return latestLoan ? latestLoan.loanDate : null;
}

async function cleanupFutureLoans() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI belum didefinisikan pada file .env backend.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  try {
    const futureLoans = await findFutureLoans();
    printFutureLoanPreview(futureLoans);

    const deletedCount = await deleteFutureLoans(futureLoans);
    const updatedBookCount = await recalculateAvailableStock();

    await validateCleanup();

    const maxLoanDate = await getMaximumLoanDate();

    console.log('================================');
    console.log('LUNAS Future Loan Cleanup');
    console.log('================================');
    console.log(formatSummaryLine('Transaksi masa depan dihapus', deletedCount));
    console.log(formatSummaryLine('Buku diperbarui', updatedBookCount));
    console.log(formatSummaryLine('Tanggal maksimum Loan', formatJakartaDate(maxLoanDate)));
    console.log('Cleanup berhasil.');
    console.log('================================');
  } finally {
    await mongoose.disconnect();
  }
}

cleanupFutureLoans().catch((error) => {
  console.error(`Cleanup future loan gagal: ${error.message}`);
  process.exit(1);
});
