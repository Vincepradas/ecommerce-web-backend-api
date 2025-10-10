const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "admin", "vendor"],
      default: "customer",
    },
    addresses: { type: Array, required: false },
    viewedProducts: {
      type: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          productViewCount: { type: Number, default: 0 },
          viewedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    purchasedProducts: {
      type: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          productPurchaseCount: { type: Number, default: 0 },
          purchasedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
