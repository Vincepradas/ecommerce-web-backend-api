import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IViewCount extends Document {
  count: number;
}

const viewCountSchema = new Schema<IViewCount>(
  {
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ViewCount: Model<IViewCount> =
  mongoose.models.count || mongoose.model<IViewCount>('count', viewCountSchema);

export default ViewCount;
