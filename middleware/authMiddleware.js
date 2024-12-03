const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token missing' });
  }

  console.log("Token from header or cookie:", token);  // Debugging line

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);  // Debugging line
    res.status(403).json({ message: 'Invalid token' });
  }
};


module.exports = authMiddleware;