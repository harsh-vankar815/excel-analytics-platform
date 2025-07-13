import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Navbar from '../navigation/Navbar';
import Sidebar from '../navigation/Sidebar';
import Footer from '../navigation/Footer';
import Modal from '../ui/Modal';
import Breadcrumb from '../navigation/Breadcrumb';
import PageTransition from '../ui/PageTransition';
import { useTheme } from '../../contexts/ThemeContext';

const MainLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { sidebarOpen, modalOpen, modalContent, modalType } = useSelector((state) => state.ui);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 480);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  // Hide breadcrumb on home/login/register pages
  const hideBreadcrumb = ['/', '/login', '/register'].includes(location.pathname);

  // Handle resize events to determine if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsSmallScreen(window.innerWidth < 480);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      minHeight: '100vh',
      background: `linear-gradient(to bottom right, ${styles.gradientFrom || '#f9fafb'}, ${styles.gradientTo || '#f3f4f6'})`,
      color: styles.textColor,
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      {/* Sidebar - only show when authenticated */}
      {isAuthenticated && (
        <Sidebar open={sidebarOpen} isMobile={isMobile} />
      )}

      {/* Main content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        transition: 'all 0.3s ease',
        marginLeft: isAuthenticated && sidebarOpen && !isMobile ? '16rem' : '0'
      }}>
        <Navbar isAdmin={false} />
        
        <main style={{
          flex: 1,
          padding: isSmallScreen ? '0.75rem' : isMobile ? '1rem' : '2rem',
          overflowX: 'hidden',
          marginTop: '4rem'
        }}>
          <div style={{
            margin: '0 auto',
            maxWidth: isSmallScreen ? '100%' : '95vw'
          }}>
            {isAuthenticated && !hideBreadcrumb && <Breadcrumb />}
            
            <div style={{
              backgroundColor: styles.cardBackground,
              borderRadius: isSmallScreen ? '0.5rem' : '0.75rem',
              boxShadow: `0 10px 15px -3px ${styles.shadowColor}, 0 4px 6px -2px ${styles.shadowColor}`,
              padding: isSmallScreen ? '1rem' : isMobile ? '1.25rem' : '1.5rem',
              marginBottom: isSmallScreen ? '1.5rem' : '2rem',
              backdropFilter: 'blur(8px)',
              background: theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'white'
            }}>
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

export default MainLayout; 