const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'LOGOUT', 'REGISTER', 'UPLOAD_FILE', 'DELETE_FILE', 'CREATE_CHART', 'UPDATE_CHART', 'DELETE_CHART', 'USER_UPDATE', 'SETTINGS_UPDATE', 'PASSWORD_RESET']
  },
  details: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: '0.0.0.0'
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
ActivityLogSchema.index({ details: 'text' });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema); 