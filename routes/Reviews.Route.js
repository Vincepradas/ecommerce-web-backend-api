const { addReview, getAllReviews, getReviewsByProduct, getReviewsByUser, getReviewById } = require("../controllers/Reviews.Controller");
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');

const router = express.Router();
const logger = require("../utils/logger");

router.use((req, res, next) => {
  logger.http(`[Reviews Route] ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/", getAllReviews);
router.get("/product/:productId", getReviewsByProduct);
router.get("/user/:userId", getReviewsByUser);
router.get("/:id", getReviewById);

router.post('/add', authMiddleware, addReview); 

module.exports = router;    