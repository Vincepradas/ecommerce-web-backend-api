
const express = require('express');
const { getAllProducts, addProduct, searchProductsByName, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/search', searchProductsByName);
router.post('/products', authMiddleware, isAdmin, addProduct);
router.put('/products/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/products/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router;
