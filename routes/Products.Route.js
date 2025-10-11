const express = require('express');
const logger = require('../utils/logger'); 
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/Product.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Logger
router.use((req, res, next) => {
  logger.http(`[Product Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Product routes
router.get('/', getProducts);
router.post('/', authMiddleware, isAdmin, addProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router;
