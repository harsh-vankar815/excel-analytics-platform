import React from 'react';

/**
 * A reusable skeleton loader component with different variants
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='text'] - Type of skeleton ('text', 'circular', 'rectangular', 'card')
 * @param {string} [props.width='100%'] - Width of the skeleton
 * @param {string} [props.height='auto'] - Height of the skeleton
 * @param {boolean} [props.animate=true] - Whether to animate the skeleton
 * @returns {JSX.Element} Skeleton component
 */
const Skeleton = ({ 
  variant = 'text', 
  width = '100%', 
  height = 'auto', 
  animate = true,
  className = '',
}) => {
  // Base classes for all skeleton types
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden';
  
  // Animation classes
  const animationClasses = animate ? 'before:absolute before:inset-0 before:-translate-x-full before:animate-pulse before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent' : '';
  
  // Variant specific classes
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'rounded-lg',
  };
  
  // Dynamic styles
  const style = {
    width,
    height: variant === 'text' ? '1rem' : height,
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.text} ${animationClasses} ${className}`}
      style={style}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Multi-line text skeleton component
 */
export const TextSkeleton = ({ lines = 3, spacing = 'mb-2', width = '100%' }) => {
  return (
    <div className="w-full">
      {[...Array(lines)].map((_, i) => (
        <Skeleton 
          key={i}
          variant="text"
          className={i < lines - 1 ? spacing : ''}
          width={i === lines - 1 && typeof width === 'string' ? '70%' : width}
        />
      ))}
    </div>
  );
};

/**
 * Card skeleton component with header and content
 */
export const CardSkeleton = ({ 
  headerHeight = '2rem',
  contentLines = 4,
  footerHeight = '2.5rem',
  showFooter = true,
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <Skeleton variant="rectangular" height={headerHeight} />
      
      <div className="p-4">
        <TextSkeleton lines={contentLines} />
      </div>
      
      {showFooter && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          <Skeleton variant="rectangular" height={footerHeight} />
        </div>
      )}
    </div>
  );
};

/**
 * Table skeleton component
 */
export const TableSkeleton = ({ 
  rows = 5, 
  columns = 4, 
  headerHeight = '2.5rem',
  rowHeight = '2rem',
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <Skeleton variant="rectangular" height={headerHeight} />
      
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {[...Array(rows)].map((_, i) => (
          <div key={i} style={{ height: rowHeight }} className="flex items-center">
            {[...Array(columns)].map((_, j) => (
              <div key={j} className="flex-1 p-2">
                <Skeleton variant="text" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton; 