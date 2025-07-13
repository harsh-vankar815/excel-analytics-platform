const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  console.log(`Creating main upload directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create excel subdirectory
const excelUploadDir = path.join(uploadDir, 'excel');
if (!fs.existsSync(excelUploadDir)) {
  console.log(`Creating excel upload directory: ${excelUploadDir}`);
  fs.mkdirSync(excelUploadDir, { recursive: true });
}

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create user-specific directory
    try {
      const userId = req.user?._id?.toString();
      if (!userId) {
        console.error('User ID not found in request');
        return cb(new Error('User not authenticated properly'), null);
      }
      
      const userDir = path.join(excelUploadDir, userId);
      if (!fs.existsSync(userDir)) {
        console.log(`Creating user directory: ${userDir}`);
        fs.mkdirSync(userDir, { recursive: true });
      }
      cb(null, userDir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
      cb(error, null);
    }
  },
  filename: function(req, file, cb) {
    try {
      // Create unique filename: timestamp-originalname
      const sanitizedName = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${Date.now()}-${sanitizedName}`;
      console.log(`Generated filename: ${filename}`);
      cb(null, filename);
    } catch (error) {
      console.error('Error generating filename:', error);
      cb(error, null);
    }
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  try {
    console.log('Validating file:', file.originalname, file.mimetype);
    
    // Allowed extensions
    const filetypes = /xlsx|xls/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const validMimetypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const mimetype = validMimetypes.includes(file.mimetype);

    if (mimetype && extname) {
      console.log('File validation passed');
      return cb(null, true);
    } else {
      console.error('Invalid file type:', file.mimetype, path.extname(file.originalname));
      cb(new Error('Error: Excel Files Only (.xls, .xlsx)'), false);
    }
  } catch (error) {
    console.error('Error in file validation:', error);
    cb(error, false);
  }
};

// Initialize upload with error handling
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

module.exports = upload; 