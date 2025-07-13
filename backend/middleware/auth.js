const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const Role = require('../models/Role');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Get token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check for token in cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from the token and populate role
    req.user = await User.findById(decoded.id).populate('roleId');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false, 
        message: `Access denied: User role '${req.user.role}' does not have permission to access this route. Required role(s): ${roles.join(', ')}`
      });
    }
    
    next();
  };
};

// Check for specific permission
exports.hasPermission = (category, permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Admin role has all permissions
      if (req.user.role === 'admin') {
        return next();
      }

      // Check if user has the specific permission
      const hasPermission = await req.user.hasPermission(category, permission);
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to perform this action'
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
}; 