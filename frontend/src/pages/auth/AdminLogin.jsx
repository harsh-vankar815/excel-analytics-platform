import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin } from '../../redux/auth/authSlice';
import Spinner from '../../components/ui/Spinner';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, user } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState(null);

  // Redirect if authenticated and is admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin');
    } else if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, user, navigate]);

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
      await dispatch(adminLogin(formData)).unwrap();
    } catch (error) {
      setLoginError(error.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ 
      background: theme === 'light' 
        ? 'linear-gradient(to bottom right, #EEF2FF, #E0F2FE)' 
        : 'linear-gradient(to bottom right, #111827, #1F2937)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M4.75 14L12 18.25L19.25 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-2" style={{ color: styles.textColor }}>Admin Login</h2>
          <p style={{ color: styles.secondaryColor }}>Sign in to access admin dashboard</p>
        </div>

        <div style={{ 
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor
        }} className="rounded-2xl shadow-xl border p-8">
          {loginError && (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 mb-6 border-l-4 border-red-500 dark:border-red-500">
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

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                placeholder="admin@example.com"
                style={{
                  backgroundColor: styles.inputBackground,
                  borderColor: errors.email ? 'rgb(239, 68, 68)' : styles.borderColor,
                  color: styles.textColor
                }}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: styles.textColor }}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${errors.password ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Enter your password"
                  style={{
                    backgroundColor: styles.inputBackground,
                    borderColor: errors.password ? 'rgb(239, 68, 68)' : styles.borderColor,
                    color: styles.textColor
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading}
                style={{
                  backgroundColor: theme === 'light' ? '#4f46e5' : styles.buttonPrimaryBackground,
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '600',
                  boxShadow: theme === 'light' ? '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)' : 'none',
                  transition: 'all 0.2s ease',
                  padding: '8px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                }}
              >
                {isLoading ? <Spinner size="sm" /> : 'Sign in as Admin'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin; 