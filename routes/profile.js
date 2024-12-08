const express = require('express');
const { getInformation, getAllInformation, addAddress } = require('../controllers/profileController');
const authMiddleware= require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Profile routes
router.get('/', authMiddleware, getInformation);
router.get('/all', authMiddleware, isAdmin, getAllInformation);
router.post('/address/:id/add', authMiddleware, addAddress);

module.exports = router;
