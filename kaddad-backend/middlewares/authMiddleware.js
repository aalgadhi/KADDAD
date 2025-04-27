const jwt = require('jsonwebtoken');
const User = require('../models/User'); // <-- Important, to load user from DB

const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    token = token.split(' ')[1]; // only the token part

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // fetch the full user (optional but good)
      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token invalid' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = protect;