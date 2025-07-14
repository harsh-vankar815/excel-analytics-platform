import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin } from '../../redux/auth/authSlice';
import Spinner from '../../components/ui/Spinner';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

const AdminRegister = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Clear register error when user makes changes
    if (registerError) {
      setRegisterError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(registerAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })).unwrap();
      navigate('/admin');
    } catch (error) {
      setRegisterError(error.message || 'Registration failed. Please try again.');
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
          <h2 className="text-3xl font-bold text-primary mb-2" style={{ color: styles.textColor }}>Admin Register</h2>
          <p style={{ color: styles.secondaryColor }}>Create a new admin account</p>
        </div>

        <div style={{ 
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor
        }} className="rounded-2xl shadow-xl border p-8">
          {registerError && (
            <div className="bg-red-50 dark:bg-red-900/30 p-4 mb-6 border-l-4 border-red-500 dark:border-red-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">{registerError}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                className={`w-full rounded-xl border ${errors.name ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                placeholder="Admin Name"
                style={{
                  backgroundColor: styles.inputBackground,
                  borderColor: errors.name ? 'rgb(239, 68, 68)' : styles.borderColor,
                  color: styles.textColor
                }}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
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
                  autoComplete="new-password"
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
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: styles.textColor }}>
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${errors.confirmPassword ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  placeholder="Confirm your password"
                  style={{
                    backgroundColor: styles.inputBackground,
                    borderColor: errors.confirmPassword ? 'rgb(239, 68, 68)' : styles.borderColor,
                    color: styles.textColor
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  {showConfirmPassword ? (
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
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
            </div>

            <div className="flex flex-col space-y-3">
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
                {isLoading ? <Spinner size="sm" /> : 'Create Admin Account'}
              </button>
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
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminRegister; 