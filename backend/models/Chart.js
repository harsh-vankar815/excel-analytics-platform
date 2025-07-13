const mongoose = require('mongoose');

const ChartSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a chart title'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify chart type'],
    enum: ['bar', 'line', 'pie', 'scatter', 'area', 'doughnut', 'radar', 'polarArea', 'bubble', 'heatmap', '3d', 'custom',
           '3d-column', '3d-bar', '3d-scatter', '3d-surface', '3d-line', '3d-bubble', '3d-heatmap', '3d-waterfall', 'stackedBar', 'horizontalBar', 'mixed']
  },
  configuration: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Chart configuration is required'],
    default: {}
  },
  data: {
    type: Object,
    required: true
  },
  sourceFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExcelFile'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  tags: [String],
  sheetName: {
    type: String,
    required: true
  },
  xAxis: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  yAxis: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  zAxis: { // For 3D charts
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  filters: [{
    field: String,
    operator: {
      type: String,
      enum: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'contains', 'startsWith', 'endsWith']
    },
    value: mongoose.Schema.Types.Mixed
  }],
  aiInsights: {
    type: String,
    default: ''
  },
  isSavedTemplate: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
ChartSchema.index({ createdBy: 1 });
ChartSchema.index({ sourceFile: 1 });
ChartSchema.index({ type: 1 });
ChartSchema.index({ viewCount: -1 });
ChartSchema.index({ createdAt: -1 });
ChartSchema.index({ isSavedTemplate: 1 });

module.exports = mongoose.model('Chart', ChartSchema);