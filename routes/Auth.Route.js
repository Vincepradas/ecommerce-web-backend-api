
const express = require('express');
const { adminSignup, customerSignup, login, getSession, vendorSignup } = require('../controllers/Auth.Controller');
const router = express.Router();

router.post('/customer/register', customerSignup);
router.post('/admin/register',adminSignup);
router.post('/login', login);
router.get('/session', getSession);
router.post('/vendor/register', vendorSignup);

module.exports = router;
