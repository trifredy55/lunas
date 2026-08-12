const jwt = require('jsonwebtoken');

const User = require('../models/User');

function getStatusMessage(status) {
  if (status === 'pending') {
    return 'Akun Anda masih menunggu persetujuan Super User.';
  }

  if (status === 'inactive') {
    return 'Akun Anda sedang dinonaktifkan. Hubungi Super User.';
  }

  return 'Akun Anda tidak dapat mengakses sistem saat ini.';
}

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Sertakan Bearer token yang valid.',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });

    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna untuk token ini tidak ditemukan.',
      });
    }

    const userStatus = user.status || 'active';
    const userRole = user.role || 'user';

    if (userStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: getStatusMessage(userStatus),
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: userRole,
      status: userStatus,
      createdAt: user.createdAt,
    };

    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token sudah kedaluwarsa. Silakan login kembali.',
      });
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah dimodifikasi.',
      });
    }

    return next(error);
  }
}

module.exports = { protect };
