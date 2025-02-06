const VendorProduct = require("../models/VendorProducts");
const AWS = require("aws-sdk");
const fs = require("fs");
const multer = require("multer");
const multerS3 = require("multer-s3");

// AWS S3 Configuration
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

// Multer S3 configuration for handling multiple media files
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

// 1. Get all vendors products
exports.getvenProducts = async (req, res) => {
  try {
    const products = await VendorProduct.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// 2. vendor adds a new product
exports.venAddProduct = async (req, res) => {
  try {
    console.log("files", req.files);
    upload(req, res, async (err) => {
      if (err) {
        return res
          .status(400)
          .json({ message: "Error uploading media", error: err.message });
      }

      // Extract product details from request body
      const {
        name,
        description,
        category,
        price,
        stock,
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

      // Create the product with media
      const newProduct = new VendorProduct({
        name,
        description,
        category,
        price,
        stock,
        media,
        thumbnail,
      });

      await newProduct.save();

      res
        .status(201)
        .json({
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
      return res.status(400).json({ message: 'No update fields provided' });
    }

    const updatedProduct = await VendorProduct.findByIdAndUpdate(
        req.params.id,
        { name, description, price, stock },
        { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

  exports.deleteProduct = async (req, res) => {
    try {
      const deletedProduct = await VendorProduct.findByIdAndDelete(req.params.id);
      if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {       
      res.status(500).json({ message: 'Server error' });
    }
  }; 