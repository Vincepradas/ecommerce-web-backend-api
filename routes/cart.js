
const express = require('express');
const {
  addToCart,
  removeFromCart,
  getCart,
  clearCart
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/add',  addToCart);
router.post('/remove',  removeFromCart);
router.get('/',  getCart);
router.delete('/clear',  clearCart);

module.exports = router;
