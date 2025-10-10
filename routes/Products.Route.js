const express = require('express');
const {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/Product.Controller');
const authMiddleware = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');


const router = express.Router();

// Product routes
router.get('/', getProducts);
router.post('/', authMiddleware, isAdmin, addProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);

module.exports = router;
