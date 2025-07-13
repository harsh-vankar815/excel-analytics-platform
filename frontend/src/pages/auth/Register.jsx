import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, googleOAuthLogin } from '../../redux/auth/authSlice';
import Spinner from '../../components/ui/Spinner';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });
  const [errors, setErrors] = useState({});
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!formData.passwordConfirm) newErrors.passwordConfirm = 'Please confirm your password';
    else if (formData.password !== formData.passwordConfirm) newErrors.passwordConfirm = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };

    try {
      await dispatch(register(userData)).unwrap();
    } catch (err) {
      // Error handling is done by the auth slice
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
        <div className="lg:flex lg:w-1/2 relative p-12 flex-col justify-between bg-indigo-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600"></div>
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(300,300)">
                <path d="M151.5,-239.5C203.5,-210.1,258.7,-177.8,285.6,-129.1C312.6,-80.4,311.2,-15.3,294.7,43.5C278.1,102.3,246.3,154.7,204.8,192.3C163.3,229.8,112.1,252.4,59.6,261.3C7,270.2,-46.9,265.4,-88.8,243.4C-130.7,221.4,-160.5,182.2,-195.3,142.5C-230,102.8,-269.7,62.6,-272.8,19.9C-275.9,-22.8,-242.4,-68,-211.1,-113.2C-179.8,-158.5,-150.7,-203.7,-112.3,-239.6C-73.9,-275.5,-26.3,-302,21.5,-335.6C69.3,-369.2,99.5,-269,151.5,-239.5Z" fill="currentColor" />
              </g>
            </svg>
          </div>

          <div className="relative">
            <h1 className="text-4xl font-bold mb-4">Excel Analytics</h1>
            <p className="text-xl font-light opacity-80 mb-6">Create an account and start your data journey</p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-1 bg-white opacity-50 rounded"></div>
              <div className="w-3 h-1 bg-white opacity-30 rounded"></div>
              <div className="w-2 h-1 bg-white opacity-20 rounded"></div>
            </div>
          </div>

          <div className="relative mt-auto">
            <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
              <div className="flex items-center space-x-6 mb-6">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M12 3L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm">Secure authentication</span>
              </div>
              <div className="flex items-center space-x-6 mb-6">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2.90625 20.2491C3.82834 18.6531 5.1542 17.3278 6.75064 16.4064C8.34708 15.485 10.1579 15 12.0002 15C13.8424 15 15.6532 15.4851 17.2497 16.4065C18.8461 17.3279 20.1719 18.6533 21.094 20.2493" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm">Personalized dashboards</span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 19V13C9 11.8954 8.10457 11 7 11H5C3.89543 11 3 11.8954 3 13V19C3 20.1046 3.89543 21 5 21H7C8.10457 21 9 20.1046 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 19V7C15 5.89543 14.1046 5 13 5H11C9.89543 5 9 5.89543 9 7V19C9 20.1046 9.89543 21 11 21H13C14.1046 21 15 20.1046 15 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 19V5C21 3.89543 20.1046 3 19 3H17C15.8954 3 15 3.89543 15 5V19C15 20.1046 15.8954 21 17 21H19C20.1046 21 21 20.1046 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm">Advanced data insights</span>
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
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: styles.textColor }}>Create your account</h2>
            <p style={{ color: styles.secondaryColor }}>
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Sign in
              </Link>
            </p>
          </div>

          <div style={{
            backgroundColor: styles.backgroundColor,
            borderColor: styles.borderColor
          }} className="rounded-2xl shadow-xl border overflow-hidden">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 p-4 border-l-4 border-red-500 dark:border-red-500">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 sm:p-8">
              {/* Social Signup */}
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
                  className="flex w-full justify-center items-center rounded-xl border py-3 px-4 text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign up with Google
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
                  }} className="px-2">Or sign up with email</span>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: styles.textColor }}>
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full rounded-xl border ${errors.name ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                      } px-4 py-3 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                    placeholder="John Doe"
                    style={{
                      backgroundColor: theme === 'dark' ? styles.inputBackground : 'white',
                      color: styles.textColor,
                      borderColor: errors.name ? '#EF4444' : styles.borderColor
                    }}
                  />
                  {errors.name && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>

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
                    className={`w-full rounded-xl border ${errors.email ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                      } px-4 py-3 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                    placeholder="you@example.com"
                    style={{
                      backgroundColor: theme === 'dark' ? styles.inputBackground : 'white',
                      color: styles.textColor,
                      borderColor: errors.email ? '#EF4444' : styles.borderColor
                    }}
                  />
                  {errors.email && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: styles.textColor }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${errors.password ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                        } px-4 py-3 pr-12 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
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
                  {errors.password && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="passwordConfirm" className="block text-sm font-medium mb-1" style={{ color: styles.textColor }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${errors.passwordConfirm ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
                        } px-4 py-3 pr-12 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                      placeholder="••••••••"
                      style={{
                        backgroundColor: theme === 'dark' ? styles.inputBackground : 'white',
                        color: styles.textColor,
                        borderColor: errors.passwordConfirm ? '#EF4444' : styles.borderColor
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                    >
                      {showConfirmPassword ? (
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
                  {errors.passwordConfirm && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.passwordConfirm}</p>}
                </div>

                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm" style={{ color: styles.secondaryColor }}>
                    I agree to the{" "}
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                      Terms and Conditions
                    </a>
                  </label>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      backgroundColor: theme === 'light' ? '#4f46e5' : styles.buttonPrimaryBackground,
                      padding: '8px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                    }}
                    className="relative w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isLoading ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <span className="opacity-0">Create Account</span>
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                <div className="text-center mt-2">
                  <Link
                    to="/admin-register"
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
                    Admin Register
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

export default Register; 