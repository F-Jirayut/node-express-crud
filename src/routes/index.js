const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const usersRoute = require('./users');
const authRoute = require('./auth');

router.get('/', indexController.getHome);

router.use('/', usersRoute);
router.use('/', authRoute);

module.exports = router;
