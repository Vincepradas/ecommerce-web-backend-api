import express from 'express';
import logger from '../utils/logger';
import { addReview, getAllReviews, getReviewById, getReviewsByProduct, getReviewsByUser } from '../controllers/Reviews.Controller';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

router.use((req, _res, next) => {
  logger.http(`[Reviews Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.get('/product/:productId', getReviewsByProduct);
router.get('/user/:userId', getReviewsByUser);
router.post('/', authMiddleware as any, addReview);

export default router;
