import authService from './authService';

const { axiosInstance } = authService;

// Upload Excel file
const uploadFile = async (formData) => {
  try {
    console.log('Sending file upload request to server');
    // Create a custom instance for this specific request to ensure proper content type
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await axiosInstance.post('/excel/upload', formData, config);
    console.log('File upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('File upload error:', error.response || error);
    throw error;
  }
};

// Get all files
const getFiles = async () => {
  const response = await axiosInstance.get('/excel');
  return response.data;
};

// Get file by ID
const getFileById = async (id) => {
  const response = await axiosInstance.get(`/excel/${id}`);
  return response.data;
};

// Delete file
const deleteFile = async (id) => {
  const response = await axiosInstance.delete(`/excel/${id}`);
  return response.data;
};

// Get recent files
const getRecentFiles = async () => {
  const response = await axiosInstance.get('/excel/recent');
  return response.data;
};

// Get most viewed files
const getMostViewedFiles = async () => {
  const response = await axiosInstance.get('/excel/most-viewed');
  return response.data;
};

// Generate AI summary for a file
const generateFileSummary = async (id) => {
  const response = await axiosInstance.post(`/ai/insights/file/${id}`);
  return response.data;
};

const fileService = {
  uploadFile,
  getFiles,
  getFileById,
  deleteFile,
  getRecentFiles,
  getMostViewedFiles,
  generateFileSummary
};

export default fileService; 