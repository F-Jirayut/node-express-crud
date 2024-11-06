const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const usersRoute = require('./users');

router.get('/', indexController.getHome);

router.use('/', usersRoute);

module.exports = router;
