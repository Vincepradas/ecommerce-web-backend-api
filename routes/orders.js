
const express = require('express');
const { createOrder, getOrder, getUserOrders, cancelOrder, updateOrderStatus, getAllOrders, directCheckout } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

router.get('/', authMiddleware, getUserOrders);
router.get('/all', authMiddleware, isAdmin, getAllOrders);
router.get('/:id', authMiddleware, getOrder);
router.post('/', authMiddleware, createOrder);
router.post('/directCheckout', authMiddleware, directCheckout);
router.delete('/cancelOrder/:id', authMiddleware, cancelOrder);
router.put('/:id/status', authMiddleware, isAdmin, updateOrderStatus);
module.exports = router;
