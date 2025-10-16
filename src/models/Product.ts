import mongoose, { Schema, Document, Model } from 'mongoose';
import MediaSchema from './Schema/MediaSchema';

interface Thumbnail {
  url: string;
  key: string;
  uploadedAt?: Date;
}

export interface IProduct extends Document {
  name: string;
  description?: string;
  category?: string;
  discountPercentage?: number;
  tags?: string[];
  weight?: number;
  price: number;
  stock: number;
  rating: number;
  media: { url: string; key: string; uploadedAt?: Date }[];
  thumbnail?: Thumbnail;
  viewCount: number;
  purchaseCount: number;
  reviewCount: number;
}

const ThumbnailSchema = new Schema<Thumbnail>({
  url: { type: String, required: true },
  key: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const productSchema = new Schema<IProduct>(
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
    media: [MediaSchema],
    thumbnail: ThumbnailSchema,
    viewCount: { type: Number, default: 0 },
    purchaseCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
