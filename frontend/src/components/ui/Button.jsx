import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Link } from 'react-router-dom';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
        outline: "border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
        danger: "bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800",
        success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

const iconVariants = cva("", {
  variants: {
    size: {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const Button = forwardRef(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    asChild, 
    href, 
    to, 
    icon: Icon, 
    iconPosition = "left", 
    isLoading = false,
    loadingText = "Loading...",
    children, 
    ...props 
  }, ref) => {
    
    const iconClasses = iconVariants({ size });
    const buttonClasses = buttonVariants({ variant, size, fullWidth, className });
    
    // If it's a link with "to" prop, use React Router's Link
    if (to) {
      return (
        <Link
          to={to}
          className={buttonClasses}
          ref={ref}
          {...props}
        >
          {iconPosition === "left" && Icon && !isLoading && (
            <Icon className={`${iconClasses} mr-2`} />
          )}
          
          {isLoading ? loadingText : children}
          
          {iconPosition === "right" && Icon && !isLoading && (
            <Icon className={`${iconClasses} ml-2`} />
          )}
        </Link>
      );
    }
    
    // If it's a regular anchor link
    if (href) {
      return (
        <a
          href={href}
          className={buttonClasses}
          ref={ref}
          {...props}
        >
          {iconPosition === "left" && Icon && !isLoading && (
            <Icon className={`${iconClasses} mr-2`} />
          )}
          
          {isLoading ? loadingText : children}
          
          {iconPosition === "right" && Icon && !isLoading && (
            <Icon className={`${iconClasses} ml-2`} />
          )}
        </a>
      );
    }
    
    // Regular button
    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg 
            className={`${iconClasses} mr-2 animate-spin`}
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!isLoading && iconPosition === "left" && Icon && (
          <Icon className={`${iconClasses} mr-2`} />
        )}
        
        {isLoading ? loadingText : children}
        
        {!isLoading && iconPosition === "right" && Icon && (
          <Icon className={`${iconClasses} ml-2`} />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants }; 