// controllers/orderController.js
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require('mongoose');

// All orders (ADMIN)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email') 
      .populate('products.productId', 'name price'); 

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// 1. Create Order
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Products are required and should be a non-empty array" });
    }

    let totalAmount = 0;
    const productUpdates = [];

    for (const item of products) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      totalAmount += product.price * item.quantity;

      // Update the stock locally and push the operation for batch processing
      product.stock -= item.quantity;
      productUpdates.push(product.save({ session }));
    }

    // Save all product stock changes
    await Promise.all(productUpdates);

    // Create and save the new order
    const order = new Order({
      user: req.user._id,
      products,
      totalAmount,
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(order);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error); 
    res.status(500).json({ message: "Server error" });
  }
};


// 2. Get a single order by ID
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "products.productId"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
    .populate('user', 'name email')
    .populate(
      "products.productId"
    );
    if (!orders || orders.length === 0) {
      return res.status(300).json({message: "No orders found"});
    } else {
      res.json(orders);
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Cancel/Delete order

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id) {
      return res.status(403).json({ message: 'You are not authorized to cancel this order' });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body; 

    // Find the order by ID
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate the new status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
