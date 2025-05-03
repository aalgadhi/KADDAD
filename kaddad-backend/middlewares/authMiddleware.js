const jwt = require('jsonwebtoken');
const User = require('../models/User'); // <-- Important, to load user from DB

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    try {
      token = token.split(' ')[1]; // only the token part

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if decoded has userId or user.userId based on the JWT code
      const userId = decoded.userId || (decoded.user && decoded.user.userId);
      if (!userId) {
        console.log("Invalid token payload: userId not found");
        return res.status(401).json({ message: 'Not authorized, invalid token payload' });
      }

      // fetch the full user (optional but good)
      const user = await User.findById(userId).select('-password');

      if (!user) {
        console.log("User not found for ID:", userId);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;  // Attach the *full* user object!

      next();
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;