import { lazy, Suspense, memo } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

// Layouts
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Loading component
const LoadingPage = () => (
  <div className="flex items-center justify-center h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy load pages for better performance
// Public Pages
const Home = lazy(() => import('../../pages/Home'));
const Login = lazy(() => import('../../pages/auth/Login'));
const Register = lazy(() => import('../../pages/auth/Register'));
const AdminLogin = lazy(() => import('../../pages/auth/AdminLogin'));
const AdminRegister = lazy(() => import('../../pages/auth/AdminRegister'));
const OAuthCallback = lazy(() => import('../../pages/auth/OAuthCallback'));
const NotFound = lazy(() => import('../../pages/NotFound'));

// Protected Pages
const Dashboard = lazy(() => import('../../pages/Dashboard'));
const FileUpload = lazy(() => import('../../pages/FileUpload'));
const FileDetails = lazy(() => import('../../pages/FileDetails'));
const Files = lazy(() => import('../../pages/Files'));
const ChartCreation = lazy(() => import('../../pages/ChartCreation'));
const ChartDetails = lazy(() => import('../../pages/ChartDetails'));
const ChartTemplateApply = lazy(() => import('../../pages/ChartTemplateApply'));
const Charts = lazy(() => import('../../pages/Charts'));
const Profile = lazy(() => import('../../pages/Profile'));
const AIInsights = lazy(() => import('../../pages/AIInsights'));

// Admin Pages
const AdminDashboard = lazy(() => import('../../pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../../pages/admin/UserManagement'));
const UserDetails = lazy(() => import('../../pages/admin/UserDetails'));
const ActivityLogs = lazy(() => import('../../pages/admin/ActivityLogs'));
const SystemSettings = lazy(() => import('../../pages/admin/SystemSettings'));
const FileManagement = lazy(() => import('../../pages/admin/FileManagement'));
const RegisterAdmin = lazy(() => import('../../pages/admin/RegisterAdmin'));

// Wrap component in Suspense for lazy loading
const LazyComponent = ({ component: Component, ...props }) => (
  <Suspense fallback={<LoadingPage />}>
    <Component {...props} />
  </Suspense>
);

// Memoize AnimatedRoutes to prevent unnecessary re-renders
const AnimatedRoutes = memo(() => {
  const location = useLocation();
  const { theme } = useTheme();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LazyComponent component={Home} />} />
          <Route path="login" element={<LazyComponent component={Login} />} />
          <Route path="register" element={<LazyComponent component={Register} />} />
          <Route path="admin-login" element={<LazyComponent component={AdminLogin} />} />
          <Route path="admin-register" element={<LazyComponent component={AdminRegister} />} />
          <Route path="oauth/callback" element={<LazyComponent component={OAuthCallback} />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/app" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route index element={<LazyComponent component={Dashboard} />} />
          <Route path="upload" element={<LazyComponent component={FileUpload} />} />
          <Route path="files" element={<LazyComponent component={Files} />} />
          <Route path="files/:id" element={<LazyComponent component={FileDetails} />} />
          <Route path="charts" element={<LazyComponent component={Charts} />} />
          <Route path="charts/create/:fileId" element={<LazyComponent component={ChartCreation} />} />
          <Route path="charts/create-from-template/:templateId" element={<LazyComponent component={ChartTemplateApply} />} />
          <Route path="charts/:id" element={<LazyComponent component={ChartDetails} />} />
          <Route path="insights" element={<LazyComponent component={AIInsights} />} />
          <Route path="profile" element={<LazyComponent component={Profile} />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<LazyComponent component={AdminDashboard} />} />
          <Route path="users" element={<LazyComponent component={UserManagement} />} />
          <Route path="users/:id" element={<LazyComponent component={UserDetails} />} />
          <Route path="files" element={<LazyComponent component={FileManagement} />} />
          <Route path="activity" element={<LazyComponent component={ActivityLogs} />} />
          <Route path="settings" element={<LazyComponent component={SystemSettings} />} />
          <Route path="register-admin" element={<LazyComponent component={RegisterAdmin} />} />
        </Route>

        {/* 404 - Not Found */}
        <Route path="*" element={<LazyComponent component={NotFound} />} />
      </Routes>
    </AnimatePresence>
  );
});

// Add display name for debugging
AnimatedRoutes.displayName = 'AnimatedRoutes';

export default AnimatedRoutes; 