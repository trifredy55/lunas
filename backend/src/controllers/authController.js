const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

function getUserRole(user) {
  return user.role || 'user';
}

function getUserStatus(user) {
  return user.status || 'active';
}

function getStatusMessage(status) {
  if (status === 'pending') {
    return 'Akun Anda masih menunggu persetujuan Super User.';
  }

  if (status === 'inactive') {
    return 'Akun Anda sedang dinonaktifkan. Hubungi Super User.';
  }

  return 'Akun Anda tidak dapat mengakses sistem saat ini.';
}

function handleValidationErrors(req, res) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return null;
  }

  return res.status(422).json({
    success: false,
    message: 'Data yang dikirim belum valid.',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: getUserRole(user),
    status: getUserStatus(user),
    createdAt: user.createdAt,
  };
}

async function register(req, res, next) {
  const validationResponse = handleValidationErrors(req, res);

  if (validationResponse) {
    return validationResponse;
  }

  try {
    const { name, password } = req.body;
    const email = req.body.email.toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Gunakan email lain atau login.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role: 'user',
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil. Akun Anda menunggu persetujuan Super User.',
      data: publicUser(newUser),
      token: generateToken(newUser),
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar. Gunakan email lain atau login.',
      });
    }

    return next(error);
  }
}

async function login(req, res, next) {
  const validationResponse = handleValidationErrors(req, res);

  if (validationResponse) {
    return validationResponse;
  }

  try {
    const { password } = req.body;
    const email = req.body.email.toLowerCase();

    const user = await User.findOne({ email }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    const userStatus = getUserStatus(user);

    if (userStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: getStatusMessage(userStatus),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: publicUser(user),
      token: generateToken(user),
    });
  } catch (error) {
    return next(error);
  }
}

function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
}

async function changePassword(req, res, next) {
  const validationResponse = handleValidationErrors(req, res);

  if (validationResponse) {
    return validationResponse;
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Data pengguna tidak ditemukan.',
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password saat ini tidak sesuai.',
      });
    }

    const isSameAsCurrentPassword = await bcrypt.compare(
      newPassword,
      user.passwordHash
    );

    if (isSameAsCurrentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password baru harus berbeda dari password saat ini.',
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diubah. Silakan login kembali.',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
  changePassword,
};
