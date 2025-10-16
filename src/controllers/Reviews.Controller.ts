import { Request, Response } from 'express';
import Review from '../models/Reviews';
import Product from '../models/Product';
import mongoose from 'mongoose';

export const addReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, comment } = req.body as { productId: string; rating: number; comment?: string };
    const userId = (req as any).user.id;

    const review = new Review({ productId, userId, rating, comment } as any);
    await review.save();

    const reviews = await Review.find({ productId });
    const avgRating = reviews.reduce((sum, r: any) => sum + r.rating, 0) / (reviews.length || 1);

    const objectId = new mongoose.Types.ObjectId(productId);
    await Product.findByIdAndUpdate(
      objectId,
      { $inc: { reviewCount: 1 }, $set: { rating: avgRating } },
      { new: true }
    );
    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllReviews = async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.find().populate('userId', 'name').populate('productId', 'name');
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = (req as any).params as { productId: string };
    const reviews = await Review.find({ productId }).populate('userId', 'name').sort({ date: -1 });
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = (req as any).params as { userId: string };
    const reviews = await Review.find({ userId }).populate('productId', 'name price').sort({ date: -1 });
    res.status(200).json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = (req as any).params as { id: string };
    const review = await Review.findById(id).populate('userId', 'name').populate('productId', 'name');
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.status(200).json(review);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
