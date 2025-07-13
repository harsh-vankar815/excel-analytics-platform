import React, { useEffect, useState } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import ExampleService from '../services/ExampleService';
import Spinner from './ui/Spinner';
import { CardSkeleton, TableSkeleton, TextSkeleton } from './ui/Skeleton';

/**
 * Example component that demonstrates the usage of loading components
 * 
 * @returns {JSX.Element} ExampleLoading component
 */
const ExampleLoading = () => {
  const { startLoading, stopLoading, withLoading } = useLoading();
  const [data, setData] = useState(null);
  const [isComponentLoading, setIsComponentLoading] = useState(true);
  const [showSpinnerExample, setShowSpinnerExample] = useState(false);

  // Simulate component loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Simulates fetching data with loading state
   */
  const handleFetchData = async () => {
    try {
      const result = await ExampleService.fetchData(startLoading, stopLoading);
      setData(result);
    } catch (error) {
      console.error('Error in handleFetchData:', error);
    }
  };

  /**
   * Simulates processing data with loading state
   */
  const handleProcessData = async () => {
    try {
      if (!data) {
        setData({ message: 'Sample data' });
      }

      const processedData = await ExampleService.processData(
        data || { message: 'Sample data' },
        withLoading
      );
      
      setData(processedData);
    } catch (error) {
      console.error('Error in handleProcessData:', error);
    }
  };

  /**
   * Simulates uploading a file with loading state
   */
  const handleUploadFile = async () => {
    try {
      // Creating a mock file for demonstration
      const mockFile = new File(['sample content'], 'sample.txt', { type: 'text/plain' });
      
      const uploadResult = await ExampleService.uploadFile(mockFile, withLoading);
      setData(uploadResult);
    } catch (error) {
      console.error('Error in handleUploadFile:', error);
    }
  };

  if (isComponentLoading) {
    return (
      <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <TextSkeleton lines={1} width="12rem" />
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-24 h-10">
                <CardSkeleton headerHeight="2.5rem" contentLines={0} showFooter={false} />
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton headerHeight="2rem" contentLines={3} />
          <div>
            <div className="mb-4">
              <TextSkeleton lines={1} width="8rem" />
            </div>
            <TableSkeleton rows={4} columns={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading Components Demo</h2>
        <p className="text-gray-600 dark:text-gray-300">
          This component demonstrates the different loading animations and skeleton loaders available in the application.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={handleFetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Show Full-screen Spinner (Border)
        </button>
        
        <button
          onClick={handleProcessData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Show Full-screen Spinner (Dots)
        </button>
        
        <button
          onClick={handleUploadFile}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Show Full-screen Spinner (Bars)
        </button>
        
        <button
          onClick={() => setShowSpinnerExample(!showSpinnerExample)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Toggle Spinners Example
        </button>
      </div>

      {showSpinnerExample && (
        <div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Spinner Variants</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center">
              <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Border</h4>
              <Spinner variant="border" size="md" color="primary" />
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center">
              <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Dots</h4>
              <Spinner variant="dots" size="md" color="success" />
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center">
              <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Pulse</h4>
              <Spinner variant="pulse" size="md" color="error" />
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center">
              <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Bars</h4>
              <Spinner variant="bars" size="md" color="primary" />
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Skeleton Loaders</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Text Skeleton</h4>
            <TextSkeleton lines={3} />
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Card Skeleton</h4>
            <CardSkeleton />
          </div>
        </div>
        
        <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="text-md font-medium mb-4 text-gray-700 dark:text-gray-300">Table Skeleton</h4>
          <TableSkeleton rows={3} columns={4} />
        </div>
      </div>

      {data && (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Data Result</h3>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-60">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ExampleLoading; 