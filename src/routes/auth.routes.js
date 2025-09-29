const express = require('express');
const authController = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

module.exports = router;