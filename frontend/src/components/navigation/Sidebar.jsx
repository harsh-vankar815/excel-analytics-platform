import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/ui/uiSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useState, useEffect } from 'react';
import Avatar from '../ui/Avatar';

const Sidebar = ({ open, isMobile, isAdmin = false }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 480);

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 480);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking on a link on mobile
  const handleLinkClick = () => {
    if (isMobile && open) {
      dispatch(toggleSidebar());
    }
  };

  // User navigation links
  const userNavLinks = [
    {
      name: 'Dashboard',
      path: '/app',
      icon: (
        <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      )
    },
    {
      name: 'Upload File',
      path: '/app/upload',
      icon: (
        <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
      )
    },
    {
      name: 'My Charts',
      path: '/app/charts',
      icon: (
        <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    },
    {
      name: 'AI Insights',
      path: '/app/insights',
      icon: (
        <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    },
    {
      name: 'My Files',
      path: '/app/files',
      icon: (
        <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
        </svg>
      )
    },
    {
      name: 'Profile',
      path: '/app/profile',
      icon: (
        <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      )
    }
  ];
  
  // Admin navigation links with categories
  const adminNavLinks = [
    {
      category: "Overview",
      items: [
        {
          name: 'Dashboard',
          path: '/admin',
          icon: (
            <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          )
        },
        {
          name: 'Activity Logs',
          path: '/admin/activity',
          icon: (
            <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          )
        }
      ]
    },
    {
      category: "User Management",
      items: [
        {
          name: 'All Users',
          path: '/admin/users',
          icon: (
            <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          )
        }
      ]
    },
    {
      category: "File Management",
      items: [
        {
          name: 'File Management',
          path: '/admin/files',
          icon: (
            <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
            </svg>
          )
        }
      ]
    },
    {
      category: "Settings",
      items: [
        {
          name: 'System Settings',
          path: '/admin/settings',
          icon: (
            <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          )
        }
      ]
    },
    {
      category: "Navigation",
      items: [
        {
          name: 'Back to App',
          path: '/app',
          icon: (
            <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
            </svg>
          )
        }
      ]
    }
  ];
  
  // Add admin link if user is admin and not already in admin section
  if (user?.role === 'admin' && !isAdmin) {
    userNavLinks.push({
      name: 'Admin',
      path: '/admin',
      icon: (
        <svg style={{ width: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem', height: isSmallScreen ? '1.125rem' : isMobile ? '1.2rem' : '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
      )
    });
  }

  // Get sidebar background color based on isAdmin and theme
  const getSidebarBackgroundColor = () => {
    if (isAdmin) {
      return theme === 'dark' ? '#1e2939' : styles.sidebarBackground;
    } else {
      return theme === 'dark' ? styles.backgroundColor : styles.sidebarBackground;
    }
  };

  // Get sidebar border color
  const getSidebarBorderColor = () => {
    if (isAdmin) {
      return theme === 'dark' ? '#2d3748' : styles.borderColor;
    } else {
      return styles.borderColor;
    }
  };

  // Get text color based on isAdmin and theme
  const getTextColor = (isActive = false) => {
    if (isAdmin) {
      return theme === 'dark'
        ? (isActive ? '#ffffff' : '#a0aec0')
        : (isActive ? styles.primaryColor : styles.textColor);
    } else {
      return isActive ? styles.primaryColor : styles.textColor;
    }
  };

  // Get hover background color
  const getHoverBackgroundColor = () => {
    if (isAdmin) {
      return theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    } else {
      return theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    }
  };

  const sidebarWidth = isSmallScreen ? '14rem' : '16rem';

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isMobile && open && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(17, 24, 39, 0.5)',
            zIndex: 20
          }}
          onClick={() => dispatch(toggleSidebar())}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        style={{
          position: 'fixed',
          height: '100vh',
          backgroundColor: getSidebarBackgroundColor(),
          borderRight: `1px solid ${getSidebarBorderColor()}`,
          boxShadow: `0 1px 3px ${styles.shadowColor}`,
          overflowY: 'auto',
          flexShrink: 0,
          transition: 'all 0.3s ease',
          width: isMobile 
            ? open ? sidebarWidth : '0'
            : open ? sidebarWidth : '0',
          left: isMobile 
            ? open ? '0' : `-${sidebarWidth}`
            : '0',
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 30 : 10,
          paddingTop: '60px' // Add top padding to account for navbar
        }}
      >
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Navigation links */}
          <nav style={{ 
            flex: 1, 
            padding: isSmallScreen ? '0.375rem' : '0.5rem', 
            paddingTop: isSmallScreen ? '0.75rem' : '1rem', 
            paddingBottom: isSmallScreen ? '0.75rem' : '1rem' 
          }}>
            {isAdmin ? (
              // Admin navigation with categories
              adminNavLinks.map((category, index) => (
                <div key={index} style={{ marginBottom: isSmallScreen ? '0.375rem' : '0.5rem' }}>
                  {/* Category heading */}
                  {(open || !isMobile) && (
                    <h3 style={{ 
                      padding: isSmallScreen ? '0 0.5rem' : '0 0.75rem', 
                      fontSize: isSmallScreen ? '0.7rem' : '0.75rem', 
                      fontWeight: '600', 
                      color: '#a0aec0', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em', 
                      marginBottom: isSmallScreen ? '0.375rem' : '0.5rem'
                    }}>
                      {category.category}
                    </h3>
                  )}
                  
                  {/* Category items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: isSmallScreen ? '0.1rem' : '0.125rem' }}>
                    {category.items.map((item, i) => (
                      <NavLink
                        key={i}
                        to={item.path}
                        onClick={handleLinkClick}
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          padding: isSmallScreen ? '0.5rem 0.625rem' : isMobile ? '0.5625rem 0.6875rem' : '0.625rem 0.75rem',
                          borderRadius: isSmallScreen ? '0.3rem' : '0.375rem',
                          textDecoration: 'none',
                          color: getTextColor(isActive),
                          backgroundColor: isActive ? (isAdmin ? 'rgba(255, 255, 255, 0.1)' : theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)') : 'transparent',
                          transition: 'all 0.2s ease',
                          fontSize: isSmallScreen ? '0.875rem' : '1rem'
                        })}
                        onMouseOver={(e) => {
                          if (!e.currentTarget.classList.contains('active')) {
                            e.currentTarget.style.backgroundColor = getHoverBackgroundColor();
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!e.currentTarget.classList.contains('active')) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ marginRight: isSmallScreen ? '0.625rem' : '0.75rem' }}>{item.icon}</span>
                        {(open || !isMobile) && <span>{item.name}</span>}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // User navigation
              <div style={{ display: 'flex', flexDirection: 'column', gap: isSmallScreen ? '0.2rem' : '0.25rem' }}>
                {userNavLinks.map((item, i) => (
                  <NavLink
                    key={i}
                    to={item.path}
                    end={item.path === '/app'}
                    onClick={handleLinkClick}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      padding: isSmallScreen ? '0.5rem 0.625rem' : isMobile ? '0.5625rem 0.6875rem' : '0.625rem 0.75rem',
                      borderRadius: isSmallScreen ? '0.3rem' : '0.375rem',
                      textDecoration: 'none',
                      color: getTextColor(isActive),
                      backgroundColor: isActive ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)') : 'transparent',
                      transition: 'all 0.2s ease',
                      fontSize: isSmallScreen ? '0.875rem' : '1rem'
                    })}
                    onMouseOver={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.backgroundColor = getHoverBackgroundColor();
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ marginRight: isSmallScreen ? '0.625rem' : '0.75rem' }}>{item.icon}</span>
                    {(open || !isMobile) && <span>{item.name}</span>}
                  </NavLink>
                ))}
              </div>
            )}
          </nav>
          
          {/* User section at bottom */}
          {user && (open || !isMobile) && (
            <div style={{ 
              padding: isSmallScreen ? '0.75rem' : '1rem', 
              borderTop: `1px solid ${isAdmin ? '#2d3748' : styles.borderColor}`,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Avatar 
                name={user?.name} 
                size={isSmallScreen ? 'sm' : 'md'} 
              />
              {(open || !isMobile) && (
                <div style={{ marginLeft: isSmallScreen ? '0.625rem' : '0.75rem' }}>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.8125rem' : '0.875rem', 
                    fontWeight: '500', 
                    color: isAdmin ? '#ffffff' : styles.textColor,
                    maxWidth: isSmallScreen ? '9rem' : '11rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.name || 'User'}
                  </div>
                  <div style={{ 
                    fontSize: isSmallScreen ? '0.6875rem' : '0.75rem', 
                    color: isAdmin ? '#a0aec0' : styles.secondaryColor,
                    maxWidth: isSmallScreen ? '9rem' : '11rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.role || 'User'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 