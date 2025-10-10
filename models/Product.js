const mongoose = require("mongoose");
const MediaSchema = require("./Schema/MediaSchema");


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
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
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
