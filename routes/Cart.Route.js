
const express = require('express');
const logger = require("../utils/logger");
const {
  addToCart,
  removeFromCart,
  getCart,
  clearCart
} = require('../controllers/Cart.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.use((req, res, next) => {
  logger.http(`[Cart Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/add', authMiddleware, addToCart);
router.post('/remove', authMiddleware, removeFromCart);
router.get('/', authMiddleware, getCart);
router.delete('/clear', authMiddleware, clearCart);

module.exports = router;
