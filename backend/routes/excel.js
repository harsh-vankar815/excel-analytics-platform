const express = require('express');
const router = express.Router();
const { 
  uploadExcel, 
  getExcelFiles, 
  getExcelFile, 
  deleteExcelFile,
  getMostViewedFiles,
  getRecentFiles
} = require('../controllers/excel');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Custom middleware to handle multer errors
const handleUploadErrors = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }
    next();
  });
};

// Routes
router.post('/upload', protect, handleUploadErrors, uploadExcel);
router.get('/', protect, getExcelFiles);
router.get('/most-viewed', protect, getMostViewedFiles);
router.get('/recent', protect, getRecentFiles);
router.get('/:id', protect, getExcelFile);
router.delete('/:id', protect, deleteExcelFile);

module.exports = router; 