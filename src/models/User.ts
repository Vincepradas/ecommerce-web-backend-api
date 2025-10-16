import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IViewedProduct {
  productId: mongoose.Types.ObjectId;
  productViewCount: number;
  viewedAt: Date;
}

export interface IPurchasedProduct {
  productId: mongoose.Types.ObjectId;
  productPurchaseCount: number;
  purchasedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin' | 'vendor';
  addresses: string[];
  viewedProducts: IViewedProduct[];
  purchasedProducts: IPurchasedProduct[];
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'admin', 'vendor'],
      default: 'customer',
    },
    addresses: { type: [String], required: false, default: [] },
    viewedProducts: {
      type: [
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product' },
          productViewCount: { type: Number, default: 0 },
          viewedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    purchasedProducts: {
      type: [
        {
          productId: { type: Schema.Types.ObjectId, ref: 'Product' },
          productPurchaseCount: { type: Number, default: 0 },
          purchasedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
