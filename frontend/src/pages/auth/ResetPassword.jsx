import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import authService from '../../services/authService'; 
import { useTheme } from '../../contexts/ThemeContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
      toast.error('Invalid password reset link');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear errors when typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await authService.resetPassword(token, formData.password);
      setIsSuccess(true);
      toast.success('Password reset successful!');
    } catch (error) {
      setFormErrors({ 
        general: error.response?.data?.message || 'Failed to reset password. The link may have expired.' 
      });
      toast.error('Failed to reset your password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ 
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
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: styles.textColor }}>{isSuccess ? 'Password Reset Complete' : 'Create New Password'}</h2>
          <p style={{ color: styles.secondaryColor }}>
            {!isSuccess ? 'Enter your new password below' : 'Your password has been updated successfully'}
          </p>
        </div>

        <div style={{ 
          backgroundColor: styles.cardBackground,
          borderColor: styles.borderColor
        }} className="rounded-2xl shadow-xl border overflow-hidden p-6 sm:p-8">
          {isSuccess ? (
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl mb-6">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">Success!</h3>
                <p className="mt-2 text-green-700 dark:text-green-300">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
              </div>
              <Link
                to="/login"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-center inline-block"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {formErrors.general && (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-6 border-l-4 border-red-500">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-300">{formErrors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: styles.textColor }}>
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${formErrors.password ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : ''} pl-4 pr-10 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                      style={{
                        borderColor: formErrors.password ? '' : styles.borderColor,
                        backgroundColor: styles.inputBackground,
                        color: styles.textColor
                      }}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowPassword(!showPassword)}
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
                  {formErrors.password && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{formErrors.password}</p>
                  )}
                  <p className="mt-1 text-xs" style={{ color: styles.secondaryColor }}>
                    Password must be at least 6 characters
                  </p>
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
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full rounded-xl border ${formErrors.confirmPassword ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : ''} pl-4 pr-10 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                      style={{
                        borderColor: formErrors.confirmPassword ? '' : styles.borderColor,
                        backgroundColor: styles.inputBackground,
                        color: styles.textColor
                      }}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {formErrors.confirmPassword && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-4 mt-8">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  style={{
                    backgroundColor: theme === 'light' ? '#ffffff' : styles.inputBackground,
                    color: theme === 'light' ? '#4b5563' : styles.textColor,
                    borderColor: theme === 'light' ? '#d1d5db' : styles.borderColor,
                    fontWeight: '500',
                    boxShadow: theme === 'light' ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
                    transition: 'all 0.2s ease',
                    padding: '8px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </button>
                <Link
                  to="/login"
                  className="w-full py-3 px-4 rounded-xl font-medium transition-colors text-center"
                  style={{ 
                    backgroundColor: styles.buttonSecondaryBackground,
                    color: styles.buttonSecondaryText
                  }}
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword; 