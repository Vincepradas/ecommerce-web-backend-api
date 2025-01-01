const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash on Delivery', 'GCash', 'PayMaya'] // Include other payment methods as needed
  },
  address: {
      type: String,
      required: true
    },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      productName: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      totalPrice: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'shipped', 'cancelled'],
    default: 'pending'
  },
  shippingStatus: {
    type: String,
    enum: ['Not Shipped', 'Shipped', 'Delivered'],
    default: 'Not Shipped'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  isCanceled: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Order', orderSchema);
