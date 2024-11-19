const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateJWT = require('../middleware/authenticateJWT');

router.post('/users', userController.createUser);
router.get('/users', authenticateJWT, userController.getAllUsers);
router.get('/users/:id', authenticateJWT, userController.getUserById);
router.put('/users/:id', authenticateJWT, userController.updateUser);
router.delete('/users/:id', authenticateJWT, userController.deleteUser);

module.exports = router;
