const express = require('express');
const { createPaymentIntent, handleWebhook, verifyPaymentLink } = require('../controllers/Payment.Controller');
const router = express.Router();
const logger = require("../utils/logger");

router.use((req, res, next) => {
  logger.http(`[Payment Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/create-payment-intent', createPaymentIntent);
router.post('/verify', verifyPaymentLink);
router.post('/webhook', handleWebhook); 

module.exports = router;
