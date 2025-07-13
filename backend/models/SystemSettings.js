const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  defaultStorageLimit: {
    type: Number,
    default: 500 // MB
  },
  defaultFileLimit: {
    type: Number,
    default: 50
  },
  defaultChartLimit: {
    type: Number,
    default: 100
  },
  contentModerationEnabled: {
    type: Boolean,
    default: true
  },
  autoApproveUploads: {
    type: Boolean,
    default: false
  },
  fileUploadSizeLimit: {
    type: Number,
    default: 10 // MB
  },
  allowedFileExtensions: {
    type: [String],
    default: ['.xlsx', '.xls', '.csv']
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Only allow one settings document
SystemSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = await this.create({});
  }
  
  return settings;
};

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema); 