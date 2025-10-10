const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash on Delivery", "GCash", "PayMaya"],
    },
    address: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productName: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "shipped", "cancelled"],
      default: "pending",
    },
    shippingStatus: {
      type: String,
      enum: ["Not Shipped", "Shipped", "Delivered"],
      default: "Not Shipped",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    isCanceled: {
      type: Boolean,
      default: false,
    },
    paymentConfirmedAt: {
      type: Date,
      default: null,
    },
    processingAt: {
      type: Date,
      default: null,
    },
    shippedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", function (next) {
  const now = new Date();

  if (this.isModified("status")) {
    switch (this.status) {
      case "pending":
        if (!this.paymentConfirmedAt) {
          this.processingAt = null;
          this.shippedAt = null;
          this.deliveredAt = null;
        }
        break;

      case "shipped":
        this.shippingStatus = "Shipped";

        if (!this.shippedAt) {
          this.shippedAt = now;
        }
        if (!this.processingAt) {
          this.processingAt = now;
        }
        if (!this.paymentConfirmedAt) {
          this.paymentConfirmedAt = now;
        }
        break;

      case "completed":
        this.shippingStatus = "Delivered";

        if (!this.deliveredAt) {
          this.deliveredAt = now;
        }
        if (!this.shippedAt) {
          this.shippedAt = now;
        }
        if (!this.processingAt) {
          this.processingAt = now;
        }
        if (!this.paymentConfirmedAt) {
          this.paymentConfirmedAt = now;
        }
        break;

      case "cancelled":
        this.isCanceled = true;
        break;
    }
  }

  if (this.isModified("shippingStatus")) {
    switch (this.shippingStatus) {
      case "Shipped":
        if (!this.shippedAt) {
          this.shippedAt = now;
        }
        if (!this.processingAt) {
          this.processingAt = now;
        }
        if (!this.paymentConfirmedAt) {
          this.paymentConfirmedAt = now;
        }

        if (this.status === "pending") {
          this.status = "shipped";
        }
        break;

      case "Delivered":
        if (!this.deliveredAt) {
          this.deliveredAt = now;
        }
        if (!this.shippedAt) {
          this.shippedAt = now;
        }
        if (!this.processingAt) {
          this.processingAt = now;
        }
        if (!this.paymentConfirmedAt) {
          this.paymentConfirmedAt = now;
        }

        if (this.status !== "completed") {
          this.status = "completed";
        }
        break;

      case "Not Shipped":
        if (this.status === "pending") {
          this.processingAt = null;
          this.shippedAt = null;
          this.deliveredAt = null;
        }
        break;
    }
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
