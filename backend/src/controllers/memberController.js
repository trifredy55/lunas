const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Member = require('../models/Member');

function handleValidationErrors(req, res) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return null;
  }

  return res.status(422).json({
    success: false,
    message: 'Data anggota yang dikirim belum valid.',
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

async function getMembers(req, res, next) {
  try {
    const members = await Member.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    return next(error);
  }
}

async function createMember(req, res, next) {
  const validationResponse = handleValidationErrors(req, res);

  if (validationResponse) {
    return validationResponse;
  }

  try {
    const { name, phone, address } = req.body;
    const email = req.body.email.toLowerCase();

    const existingMember = await Member.findOne({ email });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: 'Email anggota sudah terdaftar.',
      });
    }

    const member = await Member.create({
      name,
      email,
      phone,
      address,
    });

    return res.status(201).json({
      success: true,
      message: 'Data anggota berhasil ditambahkan.',
      data: member,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({
        success: false,
        message: 'Email anggota sudah terdaftar.',
      });
    }

    return next(error);
  }
}

async function updateMember(req, res, next) {
  const validationResponse = handleValidationErrors(req, res);

  if (validationResponse) {
    return validationResponse;
  }

  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID anggota tidak valid.',
      });
    }

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Data anggota tidak ditemukan.',
      });
    }

    const updates = {};
    const allowedFields = ['name', 'phone', 'address'];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (Object.prototype.hasOwnProperty.call(req.body, 'email')) {
      const nextEmail = req.body.email.toLowerCase();

      if (nextEmail !== member.email) {
        const duplicateMember = await Member.findOne({
          email: nextEmail,
          _id: { $ne: member._id },
        });

        if (duplicateMember) {
          return res.status(409).json({
            success: false,
            message: 'Email anggota sudah digunakan oleh anggota lain.',
          });
        }
      }

      updates.email = nextEmail;
    }

    Object.assign(member, updates);

    await member.save();

    return res.status(200).json({
      success: true,
      message: 'Data anggota berhasil diperbarui.',
      data: member,
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
      return res.status(409).json({
        success: false,
        message: 'Email anggota sudah digunakan oleh anggota lain.',
      });
    }

    return next(error);
  }
}

async function deleteMember(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID anggota tidak valid.',
      });
    }

    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Data anggota tidak ditemukan.',
      });
    }

    await member.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Data anggota berhasil dihapus.',
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
};
