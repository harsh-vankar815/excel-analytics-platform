import { useState, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DragDropFileUpload = ({ onFileSelect, acceptedFileTypes = '.xlsx,.xls', maxSize = 10 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFile = (file) => {
    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isValidType = acceptedFileTypes
      .split(',')
      .map(type => type.trim().replace('.', ''))
      .includes(fileExtension);
    
    if (!isValidType) {
      setError(`Invalid file type. Please upload ${acceptedFileTypes} files.`);
      return false;
    }
    
    // Check file size (convert MB to bytes)
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSize}MB.`);
      return false;
    }
    
    setError('');
    return true;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={acceptedFileTypes}
        className="hidden"
      />
      
      {!selectedFile ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          onClick={openFileDialog}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : `border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
                }`
          }`}
          whileHover={{ scale: 1.01 }}
          style={{
            backgroundColor: isDragging 
              ? theme === 'dark' ? 'rgba(30, 58, 138, 0.2)' : 'rgba(239, 246, 255, 0.7)' 
              : theme === 'dark' ? styles.cardBackground : 'rgb(249, 250, 251)'
          }}
        >
          <div className="flex flex-col items-center justify-center py-6">
            <ArrowUpTrayIcon className={`w-12 h-12 mb-4 ${
              isDragging ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <p className="mb-2 text-lg font-medium">
              {isDragging ? 'Drop your file here' : 'Drag and drop your Excel file here'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              or click to browse files
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Accepted file types: {acceptedFileTypes} (Max: {maxSize}MB)
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className={`border rounded-lg p-4 ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-md ${
                theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
              }`}>
                <DocumentIcon className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="font-medium truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button 
              onClick={handleRemoveFile}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
      
      {error && (
        <motion.p 
          className="mt-2 text-sm text-red-600 dark:text-red-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default DragDropFileUpload; 