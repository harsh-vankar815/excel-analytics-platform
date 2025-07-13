const mongoose = require('mongoose');

const ExcelFileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a file name'],
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sheets: [{
    name: String,
    data: mongoose.Schema.Types.Mixed // Stores the parsed Excel data
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  aiSummary: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster searches
ExcelFileSchema.index({ uploadedBy: 1 });
ExcelFileSchema.index({ createdAt: -1 });
ExcelFileSchema.index({ viewCount: -1 });

module.exports = mongoose.model('ExcelFile', ExcelFileSchema); 