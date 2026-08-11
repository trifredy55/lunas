require('dotenv').config({ quiet: true });

const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`LUNAS API berjalan pada http://localhost:${PORT}`);
});
