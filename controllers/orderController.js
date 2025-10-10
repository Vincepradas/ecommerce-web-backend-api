const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.productId", "name price");

    const orderResponse = orders.map((order) => ({
      _id: order._id,
      user: {
        name: order.user.name,
        email: order.user.email,
      },
      products: order.products.map((product) => ({
        productId: product.productId._id,
        name: product.productId.name,
        price: product.productId.price,
        quantity: product.quantity,
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      address: order.address,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderDate: order.orderDate,
      isCanceled: order.isCanceled,
    }));

    res.status(200).json(orderResponse);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { products, paymentMethod, address, isDirectCheckout } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        message: "Products are required and should be a non-empty array",
      });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    let totalAmount = 0;
    const productUpdates = [];

    for (const item of products) {
      const product = await Product.findById(item.productId).session(session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(404)
          .json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      const discount = product.discountPercentage || 0;
      const discountedPrice = product.price - product.price * (discount / 100);

      totalAmount += discountedPrice * item.quantity;

      product.stock -= item.quantity;
      productUpdates.push(product.save({ session }));
    }

    await Promise.all(productUpdates);

    const order = new Order({
      user: req.user._id,
      paymentMethod,
      address,
      products: products.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.quantity * item.price,
      })),
      totalAmount,
      status: "pending",
      shippingStatus: "Not Shipped",
      orderDate: new Date(),
      isCanceled: false,

      paymentConfirmedAt: null,
      processingAt: null,
      shippedAt: null,
      deliveredAt: null,
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

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("user", "name email")
      .populate("products.productId", "name price thumbnail")
      .sort({ createdAt: -1 });

    const orderResponse = orders.map((order) => ({
      _id: order._id,
      user: {
        name: order.user.name,
        email: order.user.email,
      },
      products: order.products.map((product) => ({
        productId: product.productId?._id || product.productId,
        name: product.productName || product.productId?.name,
        price: product.price || product.productId?.price,
        quantity: product.quantity,
        thumbnail: product.productId?.thumbnail?.url || null,
      })),
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      address: order.address,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderDate: order.orderDate || order.createdAt,

      paymentConfirmedAt: order.paymentConfirmedAt || null,
      processingAt: order.processingAt || null,
      shippedAt: order.shippedAt || null,
      deliveredAt: order.deliveredAt || null,
      isCanceled: order.isCanceled,
    }));

    res.status(200).json(orderResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to cancel this order" });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validStatuses = ["pending", "completed", "shipped", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    order.status = status;
    const now = new Date();

    switch (status) {
      case "confirmed":
        if (!order.paymentConfirmedAt) {
          order.paymentConfirmedAt = now;
        }
        break;
      case "processing":
        if (!order.processingAt) {
          order.processingAt = now;
        }
        if (!order.paymentConfirmedAt) {
          order.paymentConfirmedAt = now;
        }
        break;
      case "shipped":
        if (!order.shippedAt) {
          order.shippedAt = now;
        }
        if (!order.processingAt) {
          order.processingAt = now;
        }
        break;
      case "completed":
        if (!order.deliveredAt) {
          order.deliveredAt = now;
        }
        break;
    }

    await order.save();

    res.status(200).json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.directCheckout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity, paymentMethod, address } = req.body;

    if (!productId || !quantity || !paymentMethod || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = await Product.findById(productId).session(session);
    if (!product) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const discount = product.discountPercentage || 0;
    const discountedPrice = product.price - product.price * (discount / 100);
    const totalAmount = discountedPrice * quantity;

    product.stock -= quantity;
    await product.save({ session });

    const order = new Order({
      user: req.user._id,
      paymentMethod,
      address,
      products: [
        {
          productId,
          productName: product.name,
          quantity,
          price: discountedPrice,
          totalPrice: totalAmount,
        },
      ],
      totalAmount,
      status: "pending",
      shippingStatus: "Not Shipped",
      orderDate: new Date(),
      isCanceled: false,

      paymentConfirmedAt: null,
      processingAt: null,
      shippedAt: null,
      deliveredAt: null,
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

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, shippingStatus } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const validStatuses = ["pending", "completed", "shipped", "cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const validShippingStatuses = ["Not Shipped", "Shipped", "Delivered"];
    if (shippingStatus && !validShippingStatuses.includes(shippingStatus)) {
      return res.status(400).json({ message: "Invalid shipping status" });
    }

    if (status) {
      order.status = status;
    }

    if (shippingStatus) {
      order.shippingStatus = shippingStatus;
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate("products.productId", "name price thumbnail");

    res.status(200).json({
      message: `Order updated successfully`,
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status, shippingStatus } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: "Order IDs are required" });
    }

    const updateResults = [];

    for (const orderId of orderIds) {
      const order = await Order.findById(orderId);
      if (order) {
        if (status) order.status = status;
        if (shippingStatus) order.shippingStatus = shippingStatus;
        await order.save();
        updateResults.push({ id: orderId, success: true });
      } else {
        updateResults.push({
          id: orderId,
          success: false,
          error: "Order not found",
        });
      }
    }

    res.status(200).json({
      message: "Bulk update completed",
      results: updateResults,
    });
  } catch (error) {
    console.error("Error in bulk update:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderWithTimeline = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("products.productId", "name price thumbnail");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      _id: order._id,
      user: order.user,
      products: order.products,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      address: order.address,
      status: order.status,
      shippingStatus: order.shippingStatus,
      orderDate: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      paymentConfirmedAt: order.paymentConfirmedAt,
      processingAt: order.processingAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      isCanceled: order.isCanceled,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
};
