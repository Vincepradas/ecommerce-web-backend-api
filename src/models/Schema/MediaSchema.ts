import { Schema } from 'mongoose';

const MediaSchema = new Schema({
  url: { type: String, required: true },
  key: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default MediaSchema;
