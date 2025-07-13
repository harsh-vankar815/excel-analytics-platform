import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';

const Breadcrumb = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 480);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallScreen(window.innerWidth < 480);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Create breadcrumb paths and names
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    
    // Convert segment to display name
    let name = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Handle special cases
    if (segment === 'app') name = 'Dashboard';
    if (segment === 'charts' && pathSegments[index + 1] === 'create') name = 'Charts';
    
    // Handle IDs - if segment has no letters, it's probably an ID
    if (!/[a-zA-Z]/.test(segment)) {
      // For file IDs
      if (pathSegments[index - 1] === 'files') name = 'File Details';
      // For chart IDs
      else if (pathSegments[index - 1] === 'charts' && pathSegments[index - 2] !== 'create') name = 'Chart Details';
      // For user IDs
      else if (pathSegments[index - 1] === 'users') name = 'User Details';
    }
    
    return { name, url };
  });

  // On very small screens, only show Home and current page
  const displayBreadcrumbs = isSmallScreen 
    ? [breadcrumbs[0], breadcrumbs[breadcrumbs.length - 1]].filter(Boolean) 
    : breadcrumbs;

  return (
    <nav style={{ 
      display: 'flex',
      marginBottom: isSmallScreen ? '1rem' : '1.5rem'
    }} aria-label="Breadcrumb">
      <ol style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: isSmallScreen ? '0.375rem' : isMobile ? '0.425rem' : '0.5rem',
        backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(4px)',
        borderRadius: isSmallScreen ? '0.375rem' : '0.5rem',
        boxShadow: `0 1px 2px ${styles.shadowColor}`,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '100%'
      }}>
        <li style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: isSmallScreen ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
              fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
              fontWeight: '500',
              color: theme === 'dark' ? '#d1d5db' : '#4b5563',
              transition: 'color 0.15s ease'
            }}
            className="hover:text-blue-600 dark:hover:text-white"
          >
            <HomeIcon style={{ 
              width: isSmallScreen ? '0.875rem' : '1rem', 
              height: isSmallScreen ? '0.875rem' : '1rem', 
              marginRight: isSmallScreen ? '0.25rem' : '0.5rem' 
            }} />
            Home
          </Link>
        </li>
        
        {displayBreadcrumbs.map((breadcrumb, index) => {
          // For small screens, skip the middle items
          if (isSmallScreen && index !== displayBreadcrumbs.length - 1 && index !== 0) {
            return null;
          }
          
          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <ChevronRightIcon style={{ 
                width: isSmallScreen ? '0.75rem' : '1rem', 
                height: isSmallScreen ? '0.75rem' : '1rem', 
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                margin: isSmallScreen ? '0 0.125rem' : '0 0.25rem'
              }} />
              {index === displayBreadcrumbs.length - 1 ? (
                <span style={{
                  padding: isSmallScreen ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
                  fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
                  fontWeight: '500',
                  color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                  backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                  borderRadius: isSmallScreen ? '0.25rem' : '0.375rem',
                  maxWidth: isSmallScreen ? '120px' : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {breadcrumb.name}
                </span>
              ) : (
                <Link 
                  to={breadcrumb.url}
                  style={{
                    padding: isSmallScreen ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
                    fontSize: isSmallScreen ? '0.75rem' : '0.875rem',
                    fontWeight: '500',
                    color: theme === 'dark' ? '#9ca3af' : '#4b5563',
                    transition: 'color 0.15s ease'
                  }}
                  className="hover:text-blue-600 dark:hover:text-white"
                >
                  {breadcrumb.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 