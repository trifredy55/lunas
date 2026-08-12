const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '..', '.env'),
});

const mongoose = require('mongoose');

const connectDB = require('../src/config/db');
const User = require('../src/models/User');

async function migrateUserAccess() {
  const superUserEmail = String(process.argv[2] || '')
    .trim()
    .toLowerCase();

  if (!superUserEmail) {
    throw new Error('Email Super User wajib diberikan saat menjalankan migrasi.');
  }

  await connectDB();

  try {
    await User.updateMany(
      { role: { $exists: false } },
      { $set: { role: 'user' } }
    );

    await User.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'active' } }
    );

    const superUser = await User.findOneAndUpdate(
      { email: superUserEmail },
      {
        $set: {
          role: 'superuser',
          status: 'active',
        },
      },
      { returnDocument: 'after' }
    );

    if (!superUser) {
      throw new Error('Akun Super User yang diminta tidak ditemukan.');
    }

    console.log('Data akses pengguna berhasil dimigrasikan.');
    console.log('Super User berhasil ditetapkan.');
  } finally {
    await mongoose.disconnect();
  }
}

migrateUserAccess().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
