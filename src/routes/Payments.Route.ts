import express from 'express';
import { createPaymentIntent, handleWebhook, verifyPaymentLink } from '../controllers/Payment.Controller';
import logger from '../utils/logger';

const router = express.Router();

router.use((req, _res, next) => {
  logger.http(`[Payment Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/create-payment-intent', createPaymentIntent);
router.post('/verify', verifyPaymentLink);
router.post('/webhook', handleWebhook);

export default router;
