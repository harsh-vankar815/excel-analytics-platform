const express = require('express');
const router = express.Router();
const { 
  createChart, 
  getCharts, 
  getChart, 
  updateChart, 
  deleteChart,
  getMostViewedCharts,
  getChartsByFile,
  generateInsights,
  saveChartAsTemplate,
  getChartTemplates,
  applyChartTemplate
} = require('../controllers/chart');
const { protect } = require('../middleware/auth');

// POST routes
router.post('/', protect, createChart);
router.post('/insights', protect, generateInsights);

// GET routes for collections and special endpoints - these should come BEFORE parameter routes
router.get('/', protect, getCharts);
router.get('/most-viewed', protect, getMostViewedCharts);
router.get('/file/:fileId', protect, getChartsByFile);
router.get('/templates', protect, getChartTemplates);

// POST routes with parameters
router.post('/templates/:id/apply', protect, applyChartTemplate);
router.post('/:id/save-template', protect, saveChartAsTemplate);

// Individual chart routes with :id parameter - these should come LAST
router.get('/:id', protect, getChart);
router.put('/:id', protect, updateChart);
router.delete('/:id', protect, deleteChart);

module.exports = router; 