import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { googleOAuthLogin } from '../../redux/auth/authSlice';
import Spinner from '../../components/ui/Spinner';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleOAuth = async () => {
      if (error) {
        navigate('/login?error=oauth_failed');
        return;
      }
      
      if (token) {
        try {
          await dispatch(googleOAuthLogin(token)).unwrap();
          navigate('/app');
        } catch (err) {
          navigate('/login?error=oauth_failed');
        }
      } else {
        navigate('/login');
      }
    };
    
    handleOAuth();
  }, [token, error, dispatch, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Completing authentication...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback; 