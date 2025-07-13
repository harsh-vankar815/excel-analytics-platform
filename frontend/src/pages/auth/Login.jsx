import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, googleOAuthLogin, reset } from '../../redux/auth/authSlice';
import Spinner from '../../components/ui/Spinner';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, isAuthenticated } = useSelector((state) => state.auth);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(null);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check for OAuth error
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'oauth_failed') {
      setLoginError('Google sign in failed. Please try again or use email/password.');
      dispatch(reset());
    }
  }, [searchParams, dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Clear login error when user makes changes
    if (loginError) {
      setLoginError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(login(formData)).unwrap();
    } catch (error) {
      setLoginError(error.message || 'Invalid email or password. Please try again.');
    }
  };

  const handleGoogleLogin = () => {
    dispatch(googleOAuthLogin());
  };

  const isSmallScreen = windowWidth < 640;
  const isMediumScreen = windowWidth >= 640 && windowWidth < 1024;
  const isLargeScreen = windowWidth >= 1024;

  return (
    <div className="min-h-screen flex items-stretch" style={{ 
      background: theme === 'light' 
        ? 'linear-gradient(to bottom right, #EEF2FF, #E0F2FE)' 
        : 'linear-gradient(to bottom right, #111827, #1F2937)'
    }}>
      {/* Left Section - Illustration/Brand - Hidden on small screens */}
      {isLargeScreen && (
        <div className="lg:flex lg:w-1/2 relative p-12 flex-col justify-between bg-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600"></div>
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(300,300)">
                <path d="M125.6,-88.7C153.2,-33.1,160.2,36.8,134.2,83.5C108.2,130.2,49.3,153.6,-13.9,161.8C-77.1,170,-144.6,162.9,-176.5,122.4C-208.4,81.9,-204.7,8,-177.9,-44.9C-151.1,-97.9,-101.1,-129.9,-50.8,-149.2C-0.5,-168.4,48,-144.2,125.6,-88.7Z" fill="currentColor" />
              </g>
            </svg>
          </div>

          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">Excel Analytics</h1>
            <p className="text-xl font-light opacity-80 mb-6">Transform your data into powerful insights</p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-1 bg-white opacity-50 rounded"></div>
              <div className="w-3 h-1 bg-white opacity-30 rounded"></div>
              <div className="w-2 h-1 bg-white opacity-20 rounded"></div>
            </div>
          </div>

          <div className="relative mt-auto space-y-6">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <p className="text-white/80 text-sm mb-1">What users say</p>
              <p className="font-medium">"Excel Analytics has completely transformed how we analyze our business data. The insights are incredible!"</p>
              <div className="mt-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mr-3">
                  JD
                </div>
                <div>
                  <p className="font-medium">Jane Doe</p>
                  <p className="text-sm text-white/70">Data Analyst</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Section - Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full ${isLargeScreen ? 'lg:w-1/2' : ''} flex items-center justify-center p-4 sm:p-8`}
      >
        <div className={`w-full ${isMediumScreen || isLargeScreen ? 'max-w-md' : ''}`}>
          <div className="text-center mb-6 sm:mb-10">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-1" style={{ color: styles.textColor }}>Welcome back</h2>
            <p style={{ color: styles.secondaryColor }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Sign up
              </Link>
            </p>
          </div>

          <div style={{ 
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor
          }} className="rounded-2xl shadow-xl border overflow-hidden">
            {loginError && (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 border-l-4 border-red-500 dark:border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300">{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 sm:p-8">
              {/* Social Logins */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: theme === 'light' ? 'white' : styles.inputBackground,
                    borderColor: styles.borderColor,
                    color: styles.textColor
                  }}
                  disabled={isLoading}
                  className="flex w-full justify-center items-center rounded-xl border py-3 px-4 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: styles.borderColor }}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span style={{ 
                    backgroundColor: styles.backgroundColor,
                    color: styles.secondaryColor
                  }} className="px-2">Or continue with email</span>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: styles.textColor }}>
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-xl border ${errors.email ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                    placeholder="your.email@example.com"
                    style={{
                      backgroundColor: theme === 'dark' ? styles.inputBackground : 'white',
                      color: styles.textColor,
                      borderColor: errors.email ? '#EF4444' : styles.borderColor
                    }}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium" style={{ color: styles.textColor }}>
                      Password
                    </label>
                    <div className="text-sm">
                      <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'} px-4 py-3 pr-12 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                      placeholder="••••••••"
                      style={{
                        backgroundColor: theme === 'dark' ? styles.inputBackground : 'white',
                        color: styles.textColor,
                        borderColor: errors.password ? '#EF4444' : styles.borderColor
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: styles.secondaryColor }}>
                    Remember me
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    style={{
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: theme === 'light' ? '#4f46e5' : styles.buttonPrimaryBackground,
                    borderColor: styles.borderColor,
                  }}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 "
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner size="sm" /> : 'Sign in'}
                  </button>
                </div>
                
                <div className="text-center mt-2">
                  <Link 
                    to="/admin-login" 
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                style={{
                  backgroundColor: theme === 'light' ? '#ffffff' : styles.inputBackground,
                  color: theme === 'light' ? '#4b5563' : styles.textColor,
                  borderColor: theme === 'light' ? '#d1d5db' : styles.borderColor,
                  fontWeight: '500',
                  boxShadow: theme === 'light' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
                  transition: 'all 0.2s ease'
                }}
                  >
                    Admin Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login; 