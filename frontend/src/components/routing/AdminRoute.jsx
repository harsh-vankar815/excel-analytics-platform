import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../ui/Spinner';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin
  if (user.role !== 'admin') {
    // Redirect to dashboard if not admin
    return <Navigate to="/app" replace />;
  }

  return children;
};

export default AdminRoute; 