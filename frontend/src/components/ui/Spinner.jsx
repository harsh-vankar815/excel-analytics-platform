import React from 'react';

/**
 * A reusable spinner component with different size options and variants
 * 
 * @param {Object} props - Component props
 * @param {string} [props.size='md'] - Size of the spinner ('sm', 'md', 'lg')
 * @param {string} [props.color='primary'] - Color variant ('primary', 'white', 'success', 'error')
 * @param {string} [props.variant='border'] - Type of spinner ('border', 'dots', 'pulse', 'bars')
 * @param {boolean} [props.fullScreen=false] - Whether the spinner should be displayed full screen
 * @returns {JSX.Element} Spinner component
 */
const Spinner = ({ 
  size = 'md', 
  color = 'primary', 
  variant = 'border',
  fullScreen = false,
  text = ''
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  // Color classes
  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent dark:border-blue-500 dark:border-t-transparent',
    white: 'border-white border-t-transparent',
    success: 'border-green-600 border-t-transparent dark:border-green-500 dark:border-t-transparent',
    error: 'border-red-600 border-t-transparent dark:border-red-500 dark:border-t-transparent',
  };

  // Create spinner based on variant
  const renderSpinner = () => {
    switch(variant) {
      case 'border':
        return (
          <div 
            className={`${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary} animate-spin rounded-full`} 
            role="status" 
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
        );
      
      case 'dots':
        const dotColor = {
          primary: 'bg-blue-600 dark:bg-blue-500',
          white: 'bg-white',
          success: 'bg-green-600 dark:bg-green-500',
          error: 'bg-red-600 dark:bg-red-500',
        };
        
        const dotSize = {
          sm: 'h-1 w-1',
          md: 'h-2 w-2',
          lg: 'h-3 w-3',
        };
        
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className={`${dotSize[size] || dotSize.md} ${dotColor[color] || dotColor.primary} rounded-full animate-bounce`}
                style={{ animationDelay: `${dot * 0.1}s` }}
                role="status"
                aria-label="loading"
              />
            ))}
          </div>
        );
      
      case 'pulse':
        const pulseColor = {
          primary: 'bg-blue-600 dark:bg-blue-500',
          white: 'bg-white',
          success: 'bg-green-600 dark:bg-green-500',
          error: 'bg-red-600 dark:bg-red-500',
        };
        
        const pulseSize = {
          sm: 'h-4 w-4',
          md: 'h-8 w-8',
          lg: 'h-12 w-12',
        };
        
        return (
          <div 
            className={`${pulseSize[size] || pulseSize.md} ${pulseColor[color] || pulseColor.primary} rounded-full animate-pulse`}
            role="status"
            aria-label="loading"
          />
        );
        
      case 'bars':
        const barColor = {
          primary: 'bg-blue-600 dark:bg-blue-500',
          white: 'bg-white',
          success: 'bg-green-600 dark:bg-green-500',
          error: 'bg-red-600 dark:bg-red-500',
        };
        
        const groupSize = {
          sm: 'h-5 space-x-1',
          md: 'h-10 space-x-2',
          lg: 'h-16 space-x-3',
        };
        
        const barWidth = {
          sm: 'w-1',
          md: 'w-2',
          lg: 'w-3',
        };
        
        return (
          <div className={`flex items-end ${groupSize[size] || groupSize.md}`}>
            {[0, 1, 2, 3].map((bar) => (
              <div
                key={bar}
                className={`${barWidth[size] || barWidth.md} animate-bars ${barColor[color] || barColor.primary}`}
                style={{ 
                  animationDelay: `${bar * 0.15}s`,
                  animationDuration: '0.8s',
                  height: '40%'
                }}
                role="status"
                aria-label="loading"
              />
            ))}
          </div>
        );
        
      default:
        return (
          <div 
            className={`${sizeClasses[size] || sizeClasses.md} ${colorClasses[color] || colorClasses.primary} animate-spin rounded-full`} 
            role="status" 
            aria-label="loading"
          >
            <span className="sr-only">Loading...</span>
          </div>
        );
    }
  };

  // Full screen spinner with overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-black/50">
        {renderSpinner()}
        {text && <div className="mt-4 text-white font-medium">{text}</div>}
      </div>
    );
  }

  // Regular centered spinner
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-40">
      {renderSpinner()}
      {text && <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{text}</div>}
    </div>
  );
};

export default Spinner; 