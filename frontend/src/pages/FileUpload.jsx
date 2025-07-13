import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { uploadFile } from '../redux/file/fileSlice';
import Spinner from '../components/ui/Spinner';
import { useTheme } from '../contexts/ThemeContext';
import DragDropFileUpload from '../components/files/DragDropFileUpload';
import { motion } from 'framer-motion';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.file);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
      console.log('Uploading file:', selectedFile.name);
      // Clear any previous errors
      setError('');
      const result = await dispatch(uploadFile(formData)).unwrap();
      
      if (result && result.data && result.data._id) {
        console.log('Upload successful, navigating to file view');
        navigate(`/app/files/${result.data._id}`);
      } else {
        console.error('Upload response missing file ID:', result);
        setError('Upload successful but received invalid response from server');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload file. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Excel File</h1>
      </div>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-500 p-4 rounded"
          role="alert"
        >
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </motion.div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <DragDropFileUpload 
            onFileSelect={handleFileSelect}
            acceptedFileTypes=".xls,.xlsx"
            maxSize={10}
          />
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!selectedFile || isLoading}
            className={`px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
              !selectedFile || isLoading
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            }`}
            style={{
              backgroundColor: !selectedFile || isLoading
                ? theme === 'dark' ? '#374151' : '#d1d5db'
                : styles.primaryColor || '#3b82f6',
            }}
          >
            {isLoading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </form>
      
      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6">
        <h2 className="text-lg font-semibold mb-4">Tips for uploading</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>Make sure your Excel file is properly formatted with headers in the first row</li>
          <li>Files must be .xls or .xlsx format and less than 10MB in size</li>
          <li>For best results, ensure your data is clean and doesn't contain merged cells</li>
          <li>If your file contains multiple sheets, the first sheet will be used by default</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default FileUpload; 