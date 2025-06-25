
const express = require('express');
const {
  addToCart,
  removeFromCart,
  getCart,
  clearCart
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add', authMiddleware, addToCart);
router.post('/remove', authMiddleware, removeFromCart);
router.get('/', authMiddleware, getCart);
router.delete('/clear', authMiddleware, clearCart);

module.exports = router;
