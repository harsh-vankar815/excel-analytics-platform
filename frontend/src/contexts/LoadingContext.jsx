import React, { createContext, useContext, useState } from 'react';
import Spinner from '../components/ui/Spinner';

// Create context
const LoadingContext = createContext();

/**
 * Custom hook to use the loading context
 * @returns {Object} Loading context with methods to control loading state
 */
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

/**
 * Loading Provider component to manage loading states across the application
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} LoadingProvider component
 */
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [spinnerProps, setSpinnerProps] = useState({
    size: 'md',
    color: 'primary',
    variant: 'border'
  });

  /**
   * Start loading with optional message and spinner props
   * 
   * @param {string} [msg=''] - Loading message
   * @param {Object} [props={}] - Spinner properties
   */
  const startLoading = (msg = '', props = {}) => {
    setMessage(msg);
    setSpinnerProps(prevProps => ({ ...prevProps, ...props }));
    setLoading(true);
  };

  /**
   * Stop loading
   */
  const stopLoading = () => {
    setLoading(false);
    setMessage('');
  };

  /**
   * Execute a function with loading state
   * 
   * @param {Function} fn - Function to execute
   * @param {string} [msg='Loading...'] - Loading message
   * @param {Object} [props={}] - Spinner properties
   * @returns {Promise<any>} Result of the function
   */
  const withLoading = async (fn, msg = 'Loading...', props = {}) => {
    try {
      startLoading(msg, props);
      const result = await fn();
      return result;
    } finally {
      stopLoading();
    }
  };

  const value = {
    loading,
    message,
    spinnerProps,
    startLoading,
    stopLoading,
    withLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {loading && (
        <Spinner 
          fullScreen={true} 
          text={message}
          size={spinnerProps.size}
          color={spinnerProps.color}
          variant={spinnerProps.variant}
        />
      )}
    </LoadingContext.Provider>
  );
};

export default LoadingContext; 