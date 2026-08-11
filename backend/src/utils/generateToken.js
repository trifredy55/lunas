const jwt = require('jsonwebtoken');

function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      algorithm: 'HS256',
    }
  );
}

module.exports = generateToken;
