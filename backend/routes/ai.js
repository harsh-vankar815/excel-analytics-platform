const express = require('express');
const router = express.Router();
const { 
  generateChartInsights,
  generateFileSummary
} = require('../controllers/ai');
const { protect } = require('../middleware/auth');

// Routes
router.post('/insights/chart/:id', protect, generateChartInsights);
router.post('/insights/file/:id', protect, generateFileSummary);

module.exports = router; 