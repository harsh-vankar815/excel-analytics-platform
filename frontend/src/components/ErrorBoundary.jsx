import React from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, ArrowPathIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';

const errorVariants = {
  hidden: { 
    opacity: 0,
    y: 50
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  }
};

const childVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  }
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log the error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <motion.div 
            className="max-w-xl w-full mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
            </div>
            
            <div className="p-8">
              <motion.div variants={childVariants} className="flex justify-center mb-6">
                <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
                </div>
              </motion.div>
              
              <motion.h1 variants={childVariants} className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-4">
                Oops! Something went wrong
              </motion.h1>
              
              <motion.p variants={childVariants} className="text-gray-600 dark:text-gray-300 text-center mb-8">
                We're sorry for the inconvenience. The application encountered an unexpected error. You can try refreshing the page or going back to the previous page.
              </motion.p>
              
              <motion.div variants={childVariants} className="flex flex-col md:flex-row justify-center gap-4 mb-8">
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                  size="lg"
                  icon={ArrowPathIcon}
                >
                  Refresh Page
                </Button>
                
                <Button
                  onClick={() => window.history.back()}
                  variant="secondary"
                  size="lg"
                  icon={ArrowLeftIcon}
                >
                  Go Back
                </Button>
              </motion.div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <motion.div variants={childVariants} className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-auto">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Error Details:
                  </h2>
                  <pre className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 