const express = require('express');
const { 
  createOrder, 
  getOrder, 
  getUserOrders, 
  cancelOrder, 
  updateOrderStatus, 
  getAllOrders, 
  directCheckout 
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

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