const express = require('express');
const multer = require('multer');
const routes = require('./routes/index');

const app = express();
const upload = multer();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.array());
app.use(express.static('public'));

// Routes setup
app.use('/', routes);

// Export the app for testing purposes
module.exports = app

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
