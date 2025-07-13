import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState(null);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError(null);
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false; 
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await authService.forgotPassword({ email });
      setEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
      toast.error('Failed to send reset email');
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: styles.textColor }}>Reset Your Password</h2>
          <p style={{ color: styles.secondaryColor }}>
            {!emailSent ? 
              'Enter your email to receive a password reset link' : 
              'Check your inbox for further instructions'
            }
          </p>
        </div>

        <div style={{ 
          backgroundColor: styles.cardBackground,
          borderColor: styles.borderColor
        }} className="rounded-2xl shadow-xl border overflow-hidden p-6 sm:p-8">
          {emailSent ? (
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl mb-6">
                <div className="flex justify-center mb-4">
                  <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-green-800 dark:text-green-200">Email Sent Successfully</h3>
                <p className="mt-2 text-green-700 dark:text-green-300">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your inbox and follow the instructions.
                </p>
              </div>
              <div className="mt-6">
                <p style={{ color: styles.secondaryColor }} className="mb-4">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="flex flex-col space-y-4 mt-4">
                  <button
                    onClick={() => setEmailSent(false)}
                    className="w-full py-3 px-4 rounded-xl font-medium transition-colors"
                    style={{ 
                      backgroundColor: styles.buttonSecondaryBackground,
                      color: styles.buttonSecondaryText
                    }}
                  >
                    Try Again
                  </button>
                  <Link
                    to="/login"
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors text-center"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-6 border-l-4 border-red-500">
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

              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: styles.textColor }}>
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : ''} px-4 py-3 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                  style={{
                    borderColor: error ? '' : styles.borderColor,
                    backgroundColor: styles.inputBackground,
                    color: styles.textColor
                  }}
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-col space-y-4">
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
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword; 