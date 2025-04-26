const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token) {
    token = token.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { userId, email }
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