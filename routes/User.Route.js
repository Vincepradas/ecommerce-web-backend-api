const express = require('express');
const { getInformation, getAllInformation, addAddress } = require('../controllers/Profile.Controller');
const authMiddleware= require('../middleware/authMiddleware');
const isAdmin = require('../middleware/isAdmin');
const router = express.Router();

const logger = require("../utils/logger");
router.use((req, res, next) => {
  logger.http(`[User Route] ${req.method} ${req.originalUrl}`);
  next();
});

// Profile routes
router.get('/', authMiddleware, getInformation);
router.get('/all', authMiddleware, isAdmin, getAllInformation);
router.post('/address/:id/add', authMiddleware, addAddress);

module.exports = router;
