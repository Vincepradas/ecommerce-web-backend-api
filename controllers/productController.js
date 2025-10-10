const Product = require("../models/Product");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

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

    //get by id
    if (id) {
      const product = await Product.findByIdAndUpdate(
        id,
        { $inc: { viewCount: 1 } },
        { new: true }
      );
      if (!product) return res.status(404).json({ message: "Product not found" });
      return res.json(product);
    }

    //search by name
    if (name) {
      const products = await Product.find({
        name: { $regex: name, $options: 'i' },
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

exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Both rating and comment are required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newReview = {
      rating,
      comment,
      reviewerName: req.user.name,
      reviewerEmail: req.user.email,
    };

    product.reviews.push(newReview);

    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    product.rating = (totalRating / product.reviews.length).toFixed(1);

    await product.save();

    res.status(201).json({ message: "Review added successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId, rating, comment } = req.body;

    if (!reviewId || !rating || !comment) {
      return res
        .status(400)
        .json({ message: "Review ID, rating, and comment are required" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    review.rating = rating;
    review.comment = comment;

    const totalRating = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    product.rating = (totalRating / product.reviews.length).toFixed(1);

    await product.save();
    res.json({ message: "Review updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId } = req.body;

    if (!reviewId)
      return res.status(400).json({ message: "Review ID is required" });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const reviewIndex = product.reviews.findIndex(
      (r) => r._id.toString() === reviewId
    );
    if (reviewIndex === -1)
      return res.status(404).json({ message: "Review not found" });

    product.reviews.splice(reviewIndex, 1);

    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      product.rating = (totalRating / product.reviews.length).toFixed(1);
    } else {
      product.rating = 0;
    }

    await product.save();
    res.json({ message: "Review deleted successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
