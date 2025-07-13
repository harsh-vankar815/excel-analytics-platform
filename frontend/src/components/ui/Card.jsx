import React from 'react';
import { cva } from 'class-variance-authority';
import { useTheme } from '../../contexts/ThemeContext';

const cardVariants = cva(
  "relative overflow-hidden rounded-xl transition-all duration-300", 
  {
    variants: {
      variant: {
        default: "bg-white dark:bg-gray-800 shadow-md",
        glassmorphic: "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg",
        outlined: "bg-transparent border border-gray-200 dark:border-gray-700",
        elevated: "bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transform hover:-translate-y-1",
      },
      size: {
        sm: "p-3",
        md: "p-5",
        lg: "p-6",
        xl: "p-8"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);

const Card = ({ 
  children, 
  className, 
  variant, 
  size, 
  title, 
  subtitle,
  icon: Icon,
  footer,
  titleStyle,
  subtitleStyle,
  ...props 
}) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={cardVariants({ variant, size, className })}
      {...props}
    >
      {(title || subtitle || Icon) && (
        <div className="mb-4 flex items-start">
          {Icon && (
            <div className="mr-3 flex-shrink-0">
              <Icon className="h-6 w-6" style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />
            </div>
          )}
          <div>
            {title && (
              <h3 
                className="text-lg font-semibold" 
                style={titleStyle || { color: theme === 'dark' ? '#f9fafb' : '#1f2937' }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p 
                className="text-sm" 
                style={subtitleStyle || { color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}
              >
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 