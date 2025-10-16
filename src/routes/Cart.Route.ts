import express from 'express';
import { addToCart, removeFromCart, getCart, clearCart } from '../controllers/Cart.Controller';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.post('/add', authMiddleware as any, addToCart);
router.post('/remove', authMiddleware as any, removeFromCart);
router.get('/', authMiddleware as any, getCart);
router.post('/clear', authMiddleware as any, clearCart);

export default router;
