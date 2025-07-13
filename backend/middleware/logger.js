const ActivityLog = require('../models/ActivityLog');

/**
 * Log user activity
 * @param {Object} req - Request object
 * @param {Object} user - User object
 * @param {String} action - Action performed
 * @param {String} details - Activity details
 */
const logActivity = async (req, user, action, details) => {
  try {
    // Get IP address from request
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    
    // Get user agent from request
    const userAgent = req.headers['user-agent'] || '';
    
    // Create activity log
    await ActivityLog.create({
      user: user._id,
      action,
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

module.exports = {
  logActivity
}; 