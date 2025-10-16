import { Request, Response } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { productId, quantity } = req.body as { productId: string; quantity: number };

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      const itemIndex = cart.items.findIndex((item: any) => item.productId.equals(productId));
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity } as any);
      }
    } else {
      cart = new Cart({ user: userId, items: [{ productId, quantity }] as any });
    }

    let totalAmount = 0;
    for (const item of cart.items as any[]) {
      const itemProduct = await Product.findById(item.productId);
      totalAmount += (itemProduct?.price || 0) * item.quantity;
    }
    cart.totalAmount = totalAmount;

    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { productId } = req.body as { productId: string };

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    const itemIndex = cart.items.findIndex((item: any) => item.productId.equals(productId));
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }
    (cart.items as any[]).splice(itemIndex, 1);

    let totalAmount = 0;
    for (const item of cart.items as any[]) {
      const product = await Product.findById(item.productId);
      if (product) totalAmount += product.price * item.quantity;
    }
    cart.totalAmount = totalAmount;

    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const cart = await Cart.findOne({ user: userId }).populate('items.productId', 'name price');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const clearCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    (cart.items as any[]) = [];
    cart.updatedAt = new Date();
    await cart.save();
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
