const express = require('express');
const {
    getvenProducts,
    venAddProduct,
    updateProduct,
    deleteProduct,
} = require('../controllers/vendorsProduct');
const authMiddleware = require('../middleware/authMiddleware');
const isvendor = require('../middleware/isVendor');

const router = express.Router();

// Vendor Product routes
router.get('/products', getvenProducts);
router.post('/', venAddProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;