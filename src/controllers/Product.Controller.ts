import { Request, Response } from "express";
import Product from "../models/Product";
import User from "../models/User";
import upload from "../config/awsConfig";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";


export const getProducts = async (req: Request, res: Response) => {
  try {
    const { id, name } = req.query as { id?: string; name?: string };
    const token =
      req.headers.authorization?.split(" ")[1] ||
      (req as any).cookies?.authToken;

    let userId: string | null = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
          userId: string;
        };
        userId = decoded?.userId || null;
      } catch (err: any) {
        console.warn("Invalid JWT provided to getProducts:", err.message);
        userId = null;
      }
    }

    if (id) {
      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
      );

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          const viewedIndex = user.viewedProducts.findIndex(
            (item: any) => item.productId.toString() === id
          );
          if (viewedIndex >= 0) {
            await User.updateOne(
              { _id: userId, "viewedProducts.productId": id },
              {
                $inc: { "viewedProducts.$.productViewCount": 1 },
                $set: { "viewedProducts.$.viewedAt": new Date() },
              }
            );
          } else {
            await User.findByIdAndUpdate(userId, {
              $push: {
                viewedProducts: {
                  productId: new mongoose.Types.ObjectId(id),
                  productViewCount: 1,
                },
              },
            });
          }
        }
      }

      if (!product)
        return res.status(404).json({ message: "Product not found" });
      return res.json(product);
    }

    if (name) {
      const products = await Product.find({
        name: { $regex: name, $options: "i" },
      });
      return res.json(products);
    }

    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addProduct = async (req: Request, res: Response) => {
  try {
    console.log("files", (req as any).files);
    upload(req as any, res as any, async (err: any) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Error uploading media", error: err.message });
      }

      const {
        name,
        description,
        price,
        stock,
        category,
        discountPercentage,
        tags,
        weight,
        rating,
        reviews,
      } = req.body as any;

      let media: Array<{ url: string; key: string }> = [];
      let thumbnail: { url: string; key: string } | null = null;

      const files = (req as any).files as Record<string, any[]> | undefined;
      if (files) {
        if (files.media) {
          media = files.media.map((file) => ({
            url: file.location,
            key: file.key,
          }));
        }
        if (files.thumbnail) {
          thumbnail = files.thumbnail[0]
            ? { url: files.thumbnail[0].location, key: files.thumbnail[0].key }
            : null;
        }
      }

      const newProduct = new Product({
        name,
        description,
        price,
        stock,
        category,
        discountPercentage,
        tags,
        weight,
        rating,
        reviews,
        media,
        thumbnail,
      });

      await newProduct.save();

      res.status(201).json({
        message: "Product created successfully!",
        product: newProduct,
      });
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock } = req.body as Partial<{
      name: string;
      description: string;
      price: number;
      stock: number;
    }>;

    if (!name && !description && !price && !stock) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      (req as any).params.id,
      { name, description, price, stock },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(
      (req as any).params.id
    );
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
