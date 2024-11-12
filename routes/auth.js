
const express = require('express');
const { adminSignup, customerSignup, login } = require('../controllers/authController');
const router = express.Router();

router.post('/customer/register', customerSignup);
router.post('/admin/register',adminSignup);
router.post('/login', login);

module.exports = router;
