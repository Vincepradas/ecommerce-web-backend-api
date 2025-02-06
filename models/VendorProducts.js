const mongoose = require("mongoose");

//Media Schema
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

const vendorProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: String,
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    media: [MediaSchema],
    thumbnail: Thumbnail,
  },
  { timestamps: true }
);


const VendorProduct = mongoose.models.VendorProduct || mongoose.model('VendorProduct', vendorProductSchema);

module.exports = VendorProduct;