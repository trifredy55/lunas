const mongoose = require('mongoose');

const User = require('../models/User');

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    status: user.status || 'active',
    createdAt: user.createdAt,
  };
}

async function getUsers(req, res, next) {
  try {
    const users = await User.find({})
      .select('name email role status createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users.map(publicUser),
    });
  } catch (error) {
    return next(error);
  }
}

async function approveUser(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID pengguna tidak valid.',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Data pengguna tidak ditemukan.',
      });
    }

    const currentStatus = user.status || 'active';

    if (currentStatus === 'active') {
      return res.status(409).json({
        success: false,
        message: 'Akun pengguna sudah aktif.',
      });
    }

    user.status = 'active';
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Akun pengguna berhasil disetujui.',
      data: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

async function changeUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID pengguna tidak valid.',
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(422).json({
        success: false,
        message: 'Status pengguna yang dikirim belum valid.',
        errors: [
          {
            field: 'status',
            message: 'Status hanya boleh active atau inactive.',
          },
        ],
      });
    }

    if (req.user.id === id && status === 'inactive') {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menonaktifkan akun sendiri.',
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Data pengguna tidak ditemukan.',
      });
    }

    user.status = status;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Status pengguna berhasil diperbarui.',
      data: publicUser(user),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getUsers,
  approveUser,
  changeUserStatus,
};
