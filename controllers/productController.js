const Product = require("../models/Product");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

s3.listBuckets((err, data) => {
  if (err) {
    console.error("Error listing buckets:", err);
  } else {
    console.log("Buckets:", data.Buckets);
  }
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now().toString()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
}).fields([
  { name: "media", maxCount: 5 },
  { name: "thumbnail", maxCount: 1 },
]);

exports.getProducts = async (req, res) => {
  try {
    const { id, name } = req.query;
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies.authToken;

    let userId = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded?.userId || null;
      } catch (err) {
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

        const viewedIndex = user.viewedProducts.findIndex(
          (item) => item.productId.toString() === id
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

exports.addProduct = async (req, res) => {
  try {
    console.log("files", req.files);
    upload(req, res, async (err) => {
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
      } = req.body;

      let media = [];
      let thumbnail = null;

      if (req.files) {
        if (req.files.media) {
          media = req.files.media.map((file) => ({
            url: file.location,
            key: file.key,
          }));
        }

        if (req.files.thumbnail) {
          thumbnail = req.files.thumbnail[0]
            ? {
                url: req.files.thumbnail[0].location,
                key: req.files.thumbnail[0].key,
              }
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

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name && !description && !price && !stock) {
      return res.status(400).json({ message: "No update fields provided" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
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

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
