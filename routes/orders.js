
const express = require('express');
const { createOrder, getOrder, getUserOrders, cancelOrder } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createOrder);
router.get('/:id', authMiddleware, getOrder);
router.get('/', authMiddleware, getUserOrders);
router.delete('/cancelOrder/:id', authMiddleware, cancelOrder);

module.exports = router;
