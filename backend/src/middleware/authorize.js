function requireSuperUser(req, res, next) {
  if (req.user?.role !== 'superuser') {
    return res.status(403).json({
      success: false,
      message: 'Anda tidak memiliki izin untuk mengakses fitur ini.',
    });
  }

  return next();
}

module.exports = { requireSuperUser };
