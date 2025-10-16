import express from 'express';
import logger from '../utils/logger';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../controllers/Product.Controller';
import authMiddleware from '../middleware/authMiddleware';
import isAdmin from '../middleware/isAdmin';

const router = express.Router();

router.use((req, _res, next) => {
  logger.http(`[Product Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/', getProducts);
router.post('/', authMiddleware as any, isAdmin as any, addProduct);
router.put('/:id', authMiddleware as any, isAdmin as any, updateProduct);
router.delete('/:id', authMiddleware as any, isAdmin as any, deleteProduct);

export default router;
