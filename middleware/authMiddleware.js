
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Retrieve the user details and attach to req.user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user; 
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// In authMiddleware.js (or the relevant file)
const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name && !email && !password) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    const user = req.user; // Assuming `req.user` is populated by authMiddleware

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Update fields only if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const bcrypt = require('bcrypt');
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save(); // Save updated user to DB
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = [ authMiddleware, updateProfile ];
