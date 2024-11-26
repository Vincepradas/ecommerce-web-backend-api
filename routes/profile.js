const express = require('express');
const { getInformation, getAllInformation } = require('../controllers/profileController');
const authMiddleware= require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// Profile routes
router.get('/', authMiddleware, getInformation);
router.get('/all', authMiddleware, isAdmin, getAllInformation);


module.exports = router;
