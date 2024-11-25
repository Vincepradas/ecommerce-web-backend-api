const express = require('express');
const { getInformation, getAllInformation } = require('../controllers/profileController');
const [authMiddleware, updateProfile] = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Profile routes
router.get('/', authMiddleware, getInformation);
router.get('/all', authMiddleware, isAdmin, getAllInformation);

// Update routes
router.put('/update', authMiddleware, updateProfile);

module.exports = router;
