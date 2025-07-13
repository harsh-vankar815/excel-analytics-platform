import { useEffect, memo, lazy, Suspense } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { loadUser } from '../redux/auth/authSlice';
import { useTheme } from '../contexts/ThemeContext';

// Lazy load components
const UserDataUpdater = lazy(() => import('./UserDataUpdater'));
const AnimatedRoutes = lazy(() => import('./routing/AnimatedRoutes'));
const DebugImageTester = lazy(() => import('./DebugImageTester'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Memoize AppContent to prevent unnecessary re-renders
const AppContent = memo(() => {
  const dispatch = useDispatch();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    // Load user data only once on mount
    const timer = setTimeout(() => {
      dispatch(loadUser());
    }, 100); // small delay to allow UI to render first
    
    return () => clearTimeout(timer);
  }, [dispatch]);

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <Suspense fallback={<LoadingFallback />}>
          <UserDataUpdater />
          {process.env.NODE_ENV !== 'production' && <DebugImageTester />}
          <ToastContainer 
            position="top-right" 
            autoClose={3000}
            theme={theme}
            limit={3} // Limit number of toasts displayed
            toastStyle={{
              backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
              color: theme === 'dark' ? styles.textColor : '#1f2937',
              boxShadow: `0 4px 6px ${styles.shadowColor}`
            }}
          />
          <AnimatedRoutes />
        </Suspense>
      </div>
    </Router>
  );
});

// Add display name for debugging
AppContent.displayName = 'AppContent';

export default AppContent; 