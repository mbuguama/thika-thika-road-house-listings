const app = require('./app');
require('dotenv').config();

const port = process.env.PORT || 5000;

if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Thika House Hunter running at http://localhost:${port}`);
  });
}

module.exports = app;
