
const express = require('express');
const { adminSignup, customerSignup, login, getSession} = require('../controllers/authController');
const router = express.Router();

router.post('/customer/register', customerSignup);
router.post('/admin/register',adminSignup);
router.post('/login', login);
router.get('/session', getSession);

module.exports = router;
