import { Request, Response } from 'express';
import Profile from '../models/User';

export const getInformation = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      address: [user.addresses],
      viewedProducts: [user.viewedProducts],
      purchasedProducts: [user.purchasedProducts],
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllInformation = async (_req: Request, res: Response) => {
  try {
    const accounts = await Profile.find();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).params.id as string;
    const { address } = req.body as { address: string };
    if (!address || address.trim() === '') {
      return res.status(400).json({ message: 'Address is required' });
    }
    const user = await Profile.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    (user.addresses as any).push(address);
    await user.save();
    res.json({ message: 'Address added successfully', addresses: user.addresses });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
