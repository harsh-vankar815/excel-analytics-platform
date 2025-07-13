const ExcelFile = require('../models/ExcelFile');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const { logActivity } = require('../middleware/logger');

// @desc    Upload Excel file
// @route   POST /api/excel/upload
// @access  Private
exports.uploadExcel = async (req, res, next) => {
  try {
    console.log('File upload request received:', req.file ? req.file.originalname : 'No file');
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    console.log('File received:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Read Excel file using xlsx
    try {
      const workbook = xlsx.readFile(req.file.path);
      
      // Get sheet names
      const sheetNames = workbook.SheetNames;
      
      if (!sheetNames || sheetNames.length === 0) {
        console.error('No sheets found in Excel file');
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'No sheets found in Excel file'
        });
      }
      
      console.log(`Excel file parsed successfully. Found ${sheetNames.length} sheets`);
      
      // Parse each sheet and store data
      const sheets = sheetNames.map(name => {
        const worksheet = workbook.Sheets[name];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        return { name, data };
      });

      // Create file record in database
      const excelFile = await ExcelFile.create({
        name: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedBy: req.user._id,
        sheets
      });

      console.log('File saved to database:', excelFile._id);

      // Log activity
      await logActivity(req, req.user, 'UPLOAD_FILE', `Uploaded file: ${excelFile.originalName}`);

      res.status(201).json({
        success: true,
        data: excelFile
      });
    } catch (error) {
      console.error('Error processing Excel file:', error);
      // Delete uploaded file if an error occurs
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid Excel file or file format'
      });
    }
  } catch (error) {
    console.error('Error in uploadExcel:', error);
    // Delete uploaded file if an error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all Excel files for current user
// @route   GET /api/excel
// @access  Private
exports.getExcelFiles = async (req, res, next) => {
  try {
    const excelFiles = await ExcelFile.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: excelFiles.length,
      data: excelFiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get an Excel file by ID
// @route   GET /api/excel/:id
// @access  Private
exports.getExcelFile = async (req, res, next) => {
  try {
    const excelFile = await ExcelFile.findById(req.params.id);
    
    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check if user is owner of the file
    if (excelFile.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this file'
      });
    }

    // Increment view count
    excelFile.viewCount += 1;
    await excelFile.save();

    res.status(200).json({
      success: true,
      data: excelFile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an Excel file
// @route   DELETE /api/excel/:id
// @access  Private
exports.deleteExcelFile = async (req, res, next) => {
  try {
    const excelFile = await ExcelFile.findById(req.params.id);
    
    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check if user is owner of the file
    if (excelFile.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this file'
      });
    }

    // Delete file from filesystem
    if (fs.existsSync(excelFile.path)) {
      fs.unlinkSync(excelFile.path);
    }

    // Delete file from database
    await excelFile.deleteOne();

    // Log activity
    await logActivity(req, req.user, 'DELETE_FILE', `Deleted file: ${excelFile.originalName}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get most viewed Excel files (top 5)
// @route   GET /api/excel/most-viewed
// @access  Private
exports.getMostViewedFiles = async (req, res, next) => {
  try {
    const excelFiles = await ExcelFile.find({ uploadedBy: req.user._id })
      .sort({ viewCount: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: excelFiles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent Excel files (last 5)
// @route   GET /api/excel/recent
// @access  Private
exports.getRecentFiles = async (req, res, next) => {
  try {
    const excelFiles = await ExcelFile.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: excelFiles
    });
  } catch (error) {
    next(error);
  }
}; 