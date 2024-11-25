
const Product = require('../models/Product');

// 1. Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 3. Get product by name
exports.searchProductsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: 'Product name query is required' });
    }

    const products = await Product.find({ 
      name: { $regex: name, $options: 'i' } 
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 5. Create a new product
exports.addProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, discountPercentage, tags, weight, rating, reviews } = req.body;
    const newProduct = new Product({ name, description, price, stock, category, discountPercentage, tags, weight, rating, reviews });
    console.log(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 6. Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, stock },
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 7. Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//8. Add a review to a product
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, reviewerName, reviewerEmail } = req.body;

    if (!rating || !comment || !reviewerName || !reviewerEmail) {
      return res.status(400).json({ message: 'All review fields are required' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.reviews.push({ rating, comment, reviewerName, reviewerEmail });

    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = (totalRating / product.reviews.length).toFixed(1);

    await product.save();
    res.status(201).json({ message: 'Review added successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//9. Update a review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId, rating, comment } = req.body;

    if (!reviewId || !rating || !comment) {
      return res.status(400).json({ message: 'Review ID, rating, and comment are required' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.rating = rating;
    review.comment = comment;

    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating = (totalRating / product.reviews.length).toFixed(1);

    await product.save();
    res.json({ message: 'Review updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//10. Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewId } = req.body;

    if (!reviewId) return res.status(400).json({ message: 'Review ID is required' });

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const reviewIndex = product.reviews.findIndex(r => r._id.toString() === reviewId);
    if (reviewIndex === -1) return res.status(404).json({ message: 'Review not found' });

    product.reviews.splice(reviewIndex, 1);

    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.rating = (totalRating / product.reviews.length).toFixed(1);
    } else {
      product.rating = 0;
    }

    await product.save();
    res.json({ message: 'Review deleted successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


