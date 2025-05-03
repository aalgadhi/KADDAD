const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Verify this path is correct

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // --- CORRECTED LINE ---
      // Access the userId nested inside the 'user' object in the payload
      const userId = decoded.user?.userId; // Use optional chaining ?. for safety

      if (!userId) {
        // Log the actual decoded payload when the ID is missing
        console.log("Invalid token payload: decoded.user.userId not found. Decoded Payload:", decoded);
        return res.status(401).json({ message: 'Not authorized, invalid token payload' });
      }

      try {
        // Fetch user from DB using the extracted userId
        const user = await User.findById(userId).select('-password');

        if (!user) {
          console.log("User not found in DB for ID:", userId);
          return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        // Attach the full user object (minus password) to the request
        req.user = user;

        next(); // Proceed to the next middleware or route handler

      } catch (dbError) {
        console.error("Error fetching user from database:", dbError);
        return res.status(500).json({ message: 'Server error while fetching user' });
      }
    } catch (jwtErr) {
      console.error("JWT Verification Error:", jwtErr.message);
       // Distinguish between expired and other verification errors
      if (jwtErr.name === 'TokenExpiredError') {
         return res.status(401).json({ message: 'Not authorized, token expired' });
      }
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = protect;