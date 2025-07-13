import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Spinner from '../ui/Spinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated || !user) {
    // Redirect to login page and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute; 