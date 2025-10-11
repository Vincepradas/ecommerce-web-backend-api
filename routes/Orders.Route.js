const express = require('express');
const logger = require('../utils/logger');
const {
  createOrder,
  getOrder,
  getUserOrders,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  directCheckout
} = require('../controllers/Order.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

// Logger
router.use((req, res, next) => {
  logger.http(`[Order Route] ${req.method} ${req.originalUrl} by ${req.user?.id || 'Guest'}`);
  next();
});

// User routes
router.get('/', authMiddleware, getUserOrders);
router.get('/:id', authMiddleware, getOrder);
router.post('/', authMiddleware, createOrder);
router.post('/directCheckout', authMiddleware, directCheckout);
router.delete('/cancelOrder/:id', authMiddleware, cancelOrder);

// Admin routes
router.get('/admin/all', authMiddleware, isAdmin, getAllOrders);
router.put('/:id/status', authMiddleware, isAdmin, updateOrderStatus);
router.patch('/:id/status', authMiddleware, isAdmin, updateOrderStatus);

module.exports = router;
