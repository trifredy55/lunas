const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI belum diatur. Isi backend/.env terlebih dahulu.');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB LUNAS terhubung.');
  } catch (error) {
    console.error('Koneksi MongoDB LUNAS gagal:', error.message);
    throw error;
  }
}

module.exports = connectDB;
