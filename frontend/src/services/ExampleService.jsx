import axios from 'axios';

// Example service that uses the LoadingContext for handling async operations
const ExampleService = {
  /**
   * Example of fetching data with full-screen loading state
   * 
   * @param {Function} startLoading - Function to start loading from LoadingContext
   * @param {Function} stopLoading - Function to stop loading from LoadingContext
   * @returns {Promise<Array>} Fetched data
   */
  async fetchData(startLoading, stopLoading) {
    try {
      startLoading('Fetching data...', { variant: 'border', size: 'lg', color: 'primary' });
      
      // Simulate API call
      const response = await axios.get('/api/example-data');
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      stopLoading();
    }
  },
  
  /**
   * Example of processing data with full-screen loading state
   * 
   * @param {Object} data - Data to process
   * @param {Function} withLoading - Function to execute code with loading from LoadingContext
   * @returns {Promise<Object>} Processed data
   */
  async processData(data, withLoading) {
    try {
      // Use withLoading for cleaner loading state handling
      return await withLoading(
        async () => {
          // Simulate processing
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Simulate successful processing
          return {
            ...data,
            processed: true,
            timestamp: new Date().toISOString()
          };
        },
        'Processing data...', // Message to display
        { variant: 'dots', size: 'md', color: 'success' } // Spinner props
      );
    } catch (error) {
      console.error('Error processing data:', error);
      throw error;
    }
  },
  
  /**
   * Example of uploading file with full-screen loading state
   * 
   * @param {File} file - File to upload
   * @param {Function} withLoading - Function to execute code with loading from LoadingContext
   * @returns {Promise<Object>} Upload result
   */
  async uploadFile(file, withLoading) {
    try {
      return await withLoading(
        async () => {
          const formData = new FormData();
          formData.append('file', file);
          
          // Simulate API call
          const response = await axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          return response.data;
        },
        'Uploading file...', 
        { variant: 'bars', size: 'lg', color: 'primary' }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }
};

export default ExampleService; 