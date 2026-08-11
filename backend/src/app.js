const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LUNAS API berjalan.',
  });
});

app.use('/api/auth', authRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
