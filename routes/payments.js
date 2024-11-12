const express = require('express');
const { createPaymentIntent, attachPaymentMethod, handleWebhook } = require('../controllers/paymentControllers');
const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);
router.post('/attach-payment-method', attachPaymentMethod);
router.post('/webhook', handleWebhook);

module.exports = router;
