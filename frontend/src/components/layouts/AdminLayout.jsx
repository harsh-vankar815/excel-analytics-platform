import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from '../navigation/Navbar';
import Sidebar from '../navigation/Sidebar';
import Footer from '../navigation/Footer';
import Modal from '../ui/Modal';
import Breadcrumb from '../navigation/Breadcrumb';
import PageTransition from '../ui/PageTransition';
import { useTheme } from '../../contexts/ThemeContext';

const AdminLayout = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { sidebarOpen, modalOpen, modalContent, modalType } = useSelector((state) => state.ui);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  // Get path parts
  const path = location.pathname.split('/').filter(Boolean);
  
  // Get current admin page from URL
  const getAdminPageTitle = () => {
    if (path.length === 1) return 'Dashboard';
    if (path[1] === 'users' && path.length === 2) return 'User Management';
    if (path[1] === 'users' && path.length > 2) return 'User Details';
    if (path[1] === 'files') return 'File Management';
    if (path[1] === 'activity') return 'Activity Logs';
    if (path[1] === 'stats') return 'Platform Statistics';
    if (path[1] === 'settings') return 'System Settings';
    
    return 'Admin Dashboard';
  };

  // Get description based on current page
  const getPageDescription = () => {
    if (path[1] === 'users') return 'Manage users, their roles, and account settings.';
    if (path[1] === 'files') return 'Manage uploaded files and spreadsheets.';
    if (path[1] === 'activity') return 'Monitor user activity and system events.';
    if (path[1] === 'stats') return 'View platform usage statistics and analytics.';
    if (path[1] === 'settings') return 'Configure system settings and platform behavior.';
    
    return 'Manage users, monitor platform activity, and administer the system.';
  };

  // Handle resize events to determine if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      backgroundColor: styles.backgroundColor,
      color: styles.textColor,
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      {/* Sidebar - only show when authenticated */}
      {isAuthenticated && (
        <Sidebar open={sidebarOpen} isMobile={isMobile} isAdmin={true} />
      )}

      {/* Main content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        transition: 'margin-left 0.3s ease',
        marginLeft: isAuthenticated && sidebarOpen && !isMobile ? '16rem' : '0'
      }}>
        <Navbar isAdmin={true} />
        
        <main style={{
          flex: 1, 
          padding: isMobile ? '0.75rem' : '1.5rem', 
          overflowX: 'hidden',
          marginTop: '64px'
        }}>
          <div className="w-full" style={{ margin: '0 auto', maxWidth: '1400px' }}>
            <Breadcrumb />
            
            <div style={{
              backgroundColor: styles.backgroundColor,
              borderRadius: '0.75rem',
              boxShadow: `0 1px 3px ${styles.shadowColor}`,
              padding: isMobile ? '1rem' : '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                  fontSize: isMobile ? '1.25rem' : '1.5rem',
                  fontWeight: 'bold',
                  color: styles.textColor,
                  marginBottom: '0.5rem'
                }}>
                  {getAdminPageTitle()}
                </h1>
                <div style={{
                  height: '0.25rem',
                  width: '5rem',
                  backgroundColor: styles.primaryColor,
                  borderRadius: '9999px',
                  marginBottom: '0.75rem'
                }}></div>
                <p style={{
                  color: theme === 'dark' ? styles.secondaryColor : '#4b5563'
                }}>
                  {getPageDescription()}
                </p>
              </div>
              
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal content={modalContent} type={modalType} />
      )}
    </div>
  );
};

export default AdminLayout; 