import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  paymentMethod: 'Cash on Delivery' | 'GCash' | 'PayMaya';
  address: string;
  products: IOrderProduct[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'shipped' | 'cancelled';
  shippingStatus: 'Not Shipped' | 'Shipped' | 'Delivered';
  orderDate: Date;
  isCanceled: boolean;
  paymentConfirmedAt: Date | null;
  processingAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash on Delivery', 'GCash', 'PayMaya'],
    },
    address: { type: String, required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'shipped', 'cancelled'],
      default: 'pending',
    },
    shippingStatus: {
      type: String,
      enum: ['Not Shipped', 'Shipped', 'Delivered'],
      default: 'Not Shipped',
    },
    orderDate: { type: Date, default: Date.now },
    isCanceled: { type: Boolean, default: false },
    paymentConfirmedAt: { type: Date, default: null },
    processingAt: { type: Date, default: null },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true }
);

orderSchema.pre('save', function (next) {
  const now = new Date();
  const self = this as any;

  if (self.isModified('status')) {
    switch (self.status) {
      case 'pending':
        if (!self.paymentConfirmedAt) {
          self.processingAt = null;
          self.shippedAt = null;
          self.deliveredAt = null;
        }
        break;
      case 'shipped':
        self.shippingStatus = 'Shipped';
        if (!self.shippedAt) self.shippedAt = now;
        if (!self.processingAt) self.processingAt = now;
        if (!self.paymentConfirmedAt) self.paymentConfirmedAt = now;
        break;
      case 'completed':
        self.shippingStatus = 'Delivered';
        if (!self.deliveredAt) self.deliveredAt = now;
        if (!self.shippedAt) self.shippedAt = now;
        if (!self.processingAt) self.processingAt = now;
        if (!self.paymentConfirmedAt) self.paymentConfirmedAt = now;
        break;
      case 'cancelled':
        self.isCanceled = true;
        break;
    }
  }

  if (self.isModified('shippingStatus')) {
    switch (self.shippingStatus) {
      case 'Shipped':
        if (!self.shippedAt) self.shippedAt = now;
        if (!self.processingAt) self.processingAt = now;
        if (!self.paymentConfirmedAt) self.paymentConfirmedAt = now;
        if (self.status === 'pending') self.status = 'shipped';
        break;
      case 'Delivered':
        if (!self.deliveredAt) self.deliveredAt = now;
        if (!self.shippedAt) self.shippedAt = now;
        if (!self.processingAt) self.processingAt = now;
        if (!self.paymentConfirmedAt) self.paymentConfirmedAt = now;
        if (self.status !== 'completed') self.status = 'completed';
        break;
      case 'Not Shipped':
        if (self.status === 'pending') {
          self.processingAt = null;
          self.shippedAt = null;
          self.deliveredAt = null;
        }
        break;
    }
  }

  next();
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export default Order;
