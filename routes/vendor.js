const express = require('express');
const {
    getvenProducts,
    venAddProduct,
} = require('../controllers/vendorsProduct');
const authMiddleware = require('../middleware/authMiddleware');
const isvendor = require('../middleware/isVendor');

const router = express.Router();

// Vendor Product routes
router.get('/products', authMiddleware, isvendor, getvenProducts);
router.post('/', authMiddleware, isvendor, venAddProduct);

module.exports = router;