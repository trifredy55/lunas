const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const generateToken = require('../utils/generateToken');

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
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil.',
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

module.exports = {
  register,
  login,
  getMe,
};
