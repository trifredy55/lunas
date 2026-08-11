function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Terjadi kesalahan pada server.'
      : error.message || 'Terjadi kesalahan pada server.';

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;
