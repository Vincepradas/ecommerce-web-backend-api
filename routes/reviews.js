const { addReview, getAllReviews, getReviewsByProduct, getReviewsByUser, getReviewById } = require("../controllers/reviewsController");
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');

const router = express.Router();

router.get("/", getAllReviews);
router.get("/product/:productId", getReviewsByProduct);
router.get("/user/:userId", getReviewsByUser);
router.get("/:id", getReviewById);

router.post('/add', authMiddleware, addReview);

module.exports = router;