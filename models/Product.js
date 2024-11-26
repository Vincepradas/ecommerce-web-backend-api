const mongoose = require('mongoose');

// Media schema
const MediaSchema = new mongoose.Schema({
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
          rating: { type: Number, required: true, min: 1, max: 5 },
          comment: { type: String, required: true },
          date: { type: Date, default: () => new Date() },
          reviewerName: { type: String, required: true },
          reviewerEmail: { type: String, required: true },
        },
      ],
      media: [MediaSchema],
    },
    { timestamps: true }
);

// Prevent overwriting the model
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

module.exports = Product;
