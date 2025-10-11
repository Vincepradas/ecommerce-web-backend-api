const Review = require("../models/Reviews");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    const review = new Review({ productId, userId, rating, comment });
    await review.save();

    const reviews = await Review.find({ productId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const objectId = new mongoose.Types.ObjectId(productId);
    await Product.findByIdAndUpdate(
      objectId,
      {
        $inc: { reviewCount: 1 },
        $set: { rating: avgRating },
      },
      { new: true, useFindAndModify: false }
    );
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name")
      .populate("productId", "name");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId })
      .populate("userId", "name")
      .sort({ date: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ userId })
      .populate("productId", "name price")
      .sort({ date: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id)
      .populate("userId", "name")
      .populate("productId", "name");
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
