import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch } from 'react-redux';
import { loadUser } from './redux/auth/authSlice';
import { Provider } from 'react-redux';
import store from './redux/store';
import { useTheme } from './contexts/ThemeContext';

// Layouts
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import AdminRegister from './pages/auth/AdminRegister';
import OAuthCallback from './pages/auth/OAuthCallback';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Demo from './pages/Demo';

// Protected Pages
import Dashboard from './pages/Dashboard';
import FileUpload from './pages/FileUpload';
import FileDetails from './pages/FileDetails';
import Files from './pages/Files';
import ChartCreation from './pages/ChartCreation';
import ChartDetails from './pages/ChartDetails';
import ChartTemplateApply from './pages/ChartTemplateApply';
import Charts from './pages/Charts';
import Profile from './pages/Profile';
import AIInsights from './pages/AIInsights';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import UserDetails from './pages/admin/UserDetails';
import ActivityLogs from './pages/admin/ActivityLogs';
import SystemSettings from './pages/admin/SystemSettings';
import FileManagement from './pages/admin/FileManagement';
import RegisterAdmin from './pages/admin/RegisterAdmin';

// AnimatedRoutes component for page transitions
const AnimatedRoutes = () => {
  const location = useLocation();
  const { theme } = useTheme();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="admin-login" element={<AdminLogin />} />
          <Route path="admin-register" element={<AdminRegister />} />
          <Route path="oauth/callback" element={<OAuthCallback />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
          <Route path="demo" element={<Demo />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/app" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="upload" element={<FileUpload />} />
          <Route path="files" element={<Files />} />
          <Route path="files/:id" element={<FileDetails />} />
          <Route path="charts" element={<Charts />} />
          <Route path="charts/create/:fileId" element={<ChartCreation />} />
          <Route path="charts/create-from-template/:templateId" element={<ChartTemplateApply />} />
          <Route path="charts/:id" element={<ChartDetails />} />
          <Route path="insights" element={<AIInsights />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="files" element={<FileManagement />} />
          <Route path="activity" element={<ActivityLogs />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="register-admin" element={<RegisterAdmin />} />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

function AppContent() {
  const dispatch = useDispatch();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    // Load user on app start if token exists
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme={theme}
          toastStyle={{
            backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
            color: theme === 'dark' ? styles.textColor : '#1f2937',
            boxShadow: `0 4px 6px ${styles.shadowColor}`
          }}
        />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
