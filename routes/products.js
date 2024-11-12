
const express = require('express');
const { getAllProducts, addProduct, searchProductsByName, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/search', searchProductsByName);
router.post('/', authMiddleware, addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
