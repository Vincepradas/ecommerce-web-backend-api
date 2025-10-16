import express from 'express';
import { getInformation, getAllInformation, addAddress } from '../controllers/Profile.Controller';
import authMiddleware from '../middleware/authMiddleware';
import isAdmin from '../middleware/isAdmin';
import logger from '../utils/logger';

const router = express.Router();

router.use((req, _res, next) => {
  logger.http(`[User Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/', authMiddleware as any, getInformation);
router.get('/all', authMiddleware as any, isAdmin as any, getAllInformation);
router.post('/address/:id/add', authMiddleware as any, addAddress);

export default router;
