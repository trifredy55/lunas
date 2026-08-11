require('dotenv').config({ quiet: true });

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`LUNAS API berjalan pada http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('LUNAS gagal dijalankan karena koneksi database gagal.');
    process.exit(1);
  }
}

startServer();
