const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, authValidationRules } = require('../middleware/validator');

const router = express.Router();

router.post('/register', validate(authValidationRules.register), register);
router.post('/login', validate(authValidationRules.login), login);
router.get('/me', protect, getMe);

module.exports = router;
