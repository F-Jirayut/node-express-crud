const express = require('express');
const app = express();
var multer = require('multer');
var upload = multer();
const port = 3000;

app.use(express.json()); 

app.use(express.urlencoded({ extended: true })); 

app.use(upload.array()); 
app.use(express.static('public'));

const routes = require('./routes/index');

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running at <http://localhost>:${port}/`);
});