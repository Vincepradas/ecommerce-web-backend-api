import express from 'express';
import { adminSignup, customerSignup, login, getSession, vendorSignup } from '../controllers/Auth.Controller';
import logger from '../utils/logger';

const router = express.Router();

router.use((req, _res, next) => {
  logger.http(`[Auth Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/customer/register', customerSignup);
router.post('/admin/register', adminSignup);
router.post('/login', login);
router.get('/session', getSession);
router.post('/vendor/register', vendorSignup);

export default router;
