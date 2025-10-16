import express from 'express';
import logger from '../utils/logger';
import { createOrder, getOrder, getUserOrders, cancelOrder, updateOrderStatus, getAllOrders, directCheckout } from '../controllers/Order.Controller';
import authMiddleware from '../middleware/authMiddleware';
import isAdmin from '../middleware/isAdmin';

const router = express.Router();

router.use((req, _res, next) => {
  logger.http(`[Order Route] ${req.method} ${req.originalUrl} by ${(req as any).user?.id || 'Guest'}`);
  next();
});

router.get('/', authMiddleware as any, getUserOrders);
router.get('/:id', authMiddleware as any, getOrder);
router.post('/', authMiddleware as any, createOrder);
router.post('/directCheckout', authMiddleware as any, directCheckout);
router.delete('/cancelOrder/:id', authMiddleware as any, cancelOrder);

router.get('/admin/all', authMiddleware as any, isAdmin as any, getAllOrders);
router.put('/:id/status', authMiddleware as any, isAdmin as any, updateOrderStatus);
router.patch('/:id/status', authMiddleware as any, isAdmin as any, updateOrderStatus);

export default router;
