
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: String,
  category: String,
  discountPercentage: Number,
  tags: [String],
  weight: Number,
  price: {type: Number, required: true},
  stock: {type: Number, default: 0},
  rating: {type: Number, default: 0},
  reviews: [
    {
      rating: {type: Number, required: true, min: 1, max: 5},
      comment: {type: String, required: true},
      date: {type: Date, default: () => new Date()},
      reviewerName: {type: String, required: true},
      reviewerEmail: {type: String, required: true}
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
