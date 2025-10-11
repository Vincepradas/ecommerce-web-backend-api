const mongoose = require("mongoose");
const MediaSchema = require("./Schema/MediaSchema");

const Thumbnail = new mongoose.Schema({
  url: { type: String, required: true },
  key: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

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
    media: [MediaSchema],
    thumbnail: Thumbnail,
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
