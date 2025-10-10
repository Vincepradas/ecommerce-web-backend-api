const express = require('express');
const {
    getProducts,
    addProduct,
    searchProductsByName,
    getProductById,
    updateProduct,
    deleteProduct,
    addReview,
    updateReview,
    deleteReview,
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');


const router = express.Router();

// Product routes
router.get('/', getProducts);
router.post('/', authMiddleware, isAdmin, addProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

// Review routes
router.post('/:id/reviews', authMiddleware, addReview);
router.put('/:id/reviews', authMiddleware, updateReview);
router.delete('/:id/reviews', authMiddleware, deleteReview);

module.exports = router;
