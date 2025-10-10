const mongoose = require("mongoose");

// Media schema
const MediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  key: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

//Thumbnail schema
const Thumbnail = new mongoose.Schema({
  url: { type: String, required: true },
  key: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Product schema
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: String,
    discountPercentage: Number,
    tags: [String],
    weight: Number,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: [
      {
        rating: { type: Number, required: false, min: 1, max: 5 },
        comment: { type: String, required: false },
        date: { type: Date, default: () => new Date() },
        reviewerName: { type: String, required: false },
        reviewerEmail: { type: String, required: false },
      },
    ],
    media: [MediaSchema],
    thumbnail: Thumbnail,
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Prevent overwriting the model
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
