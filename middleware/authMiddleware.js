// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.header('Authorization');
  
  // Check if the authorization header is present and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Extract the token from the header
  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
