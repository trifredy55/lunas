const Book = require('../models/Book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');

async function getDashboardSummary(req, res, next) {
  try {
    const [totalBooks, totalMembers, totalLoans, availableBooksResult, categoryResult] =
      await Promise.all([
        Book.countDocuments(),
        Member.countDocuments(),
        Loan.countDocuments(),
        Book.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: '$availableStock' },
            },
          },
        ]),
        Book.aggregate([
          {
            $group: {
              _id: '$category',
              total: { $sum: 1 },
            },
          },
          {
            $sort: { total: -1, _id: 1 },
          },
        ]),
      ]);

    const availableBooks =
      availableBooksResult.length > 0 ? availableBooksResult[0].total : 0;

    const booksByCategory = categoryResult.map((item) => ({
      category: item._id,
      total: item.total,
    }));

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBooks,
          totalMembers,
          totalLoans,
          availableBooks,
        },
        booksByCategory,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDashboardSummary,
};
