import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/ui/uiSlice';
import { logout } from '../../redux/auth/authSlice';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Avatar from '../ui/Avatar';

const Navbar = ({ isAdmin = false }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { theme, toggleTheme, getThemeStyles } = useTheme();
  const styles = getThemeStyles(); 
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 480);
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle resize events to determine screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallScreen(window.innerWidth < 480);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav style={{ 
      backgroundColor: styles.backgroundColor, 
      color: styles.textColor,
      borderBottom: `1px solid ${styles.borderColor}`,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: '60px'
    }}>
      <div style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 0.5rem' : '0 1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isAuthenticated && (
            <button
              onClick={() => dispatch(toggleSidebar())}
              style={{ 
                color: styles.secondaryColor,
                backgroundColor: 'transparent',
                padding: isMobile ? '0.25rem' : '0.5rem',
                borderRadius: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginRight: isMobile ? '0.25rem' : '0.5rem'
              }}
              aria-label="Toggle sidebar"
            >
              <svg style={{ width: isMobile ? '1.25rem' : '1.5rem', height: isMobile ? '1.25rem' : '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '0.75rem', textDecoration: 'none' }}>
            <div style={{ 
              height: isMobile ? '1.75rem' : '2rem', 
              width: isMobile ? '1.75rem' : '2rem', 
              background: 'linear-gradient(to right, #3b82f6, #4f46e5)',
              borderRadius: '0.375rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: isMobile ? '1rem' : '1.25rem', height: isMobile ? '1rem' : '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span style={{ 
              color: styles.textColor, 
              fontSize: isSmallScreen ? '1rem' : isMobile ? '1.125rem' : '1.25rem', 
              fontWeight: '700',
              display: isSmallScreen && isAdmin ? 'none' : 'inline'
            }}>
              {isAdmin ? 'Admin Portal' : 'Excel Analytics'}
            </span>
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
          {/* Demo Link - Only show when not authenticated */}
          {!isAuthenticated && !isAdmin && (
            <Link
              to="/demo"
              style={{
                textDecoration: 'none',
                color: styles.textColor,
                fontSize: isMobile ? '0.875rem' : '1rem',
                fontWeight: '500',
                padding: isMobile ? '0.375rem 0.5rem' : '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(59, 130, 246, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)';
              }}
            >
              Try Demo
            </Link>
          )}
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            style={{
              backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
              color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
              border: 'none',
              padding: isMobile ? '6px' : '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: `0 1px 3px ${styles.shadowColor}`,
              transition: 'all 0.2s ease'
            }}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width={isMobile ? "18" : "20"} height={isMobile ? "18" : "20"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          {/* User menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: isMobile ? '0.5rem' : '0.75rem', 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <Avatar 
                  name={user?.name} 
                  size={isMobile ? 'sm' : 'md'} 
                />
                {!isSmallScreen && <span style={{ color: styles.textColor, fontSize: isMobile ? '0.875rem' : '1rem' }}>{user?.name}</span>}
              </button>

              {dropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '0.5rem',
                    width: isMobile ? '10rem' : '12rem',
                    backgroundColor: styles.backgroundColor,
                    boxShadow: `0 4px 6px ${styles.shadowColor}`,
                    border: `1px solid ${styles.borderColor}`,
                    borderRadius: '0.375rem',
                    padding: '0.25rem 0',
                    zIndex: 50
                  }}
                >
                  <Link
                    to="/app/profile"
                    style={{ 
                      display: 'block',
                      padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      color: styles.textColor,
                      textDecoration: 'none'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Your Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      style={{ 
                        display: 'block',
                        padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
                        fontSize: isMobile ? '0.75rem' : '0.875rem',
                        color: styles.textColor,
                        textDecoration: 'none'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{ 
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                      color: styles.textColor,
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '0.5rem' : '1rem' }}>
              <Link
                to="/login"
                style={{ 
                  color: styles.textColor,
                  textDecoration: 'none',
                  padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Log in
              </Link>
              <Link
                to="/register"
                style={{ 
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 