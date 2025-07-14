import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin } from '../../redux/auth/authSlice';
import Spinner from '../../components/ui/Spinner';
import { useTheme } from '../../contexts/ThemeContext';

const RegisterAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
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

    if (formData.password !== formData.confirmPassword) {
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
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ color: styles.textColor }}>Register New Admin</h2>
        <p className="text-gray-600 dark:text-gray-400">Create a new admin user account</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl">
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
              value={formData.name}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.name ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
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
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.email ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
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
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-lg border ${errors.password ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                placeholder="Enter password"
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
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-red-500 dark:border-red-400 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'} px-4 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
              placeholder="Confirm password"
              style={{
                backgroundColor: styles.inputBackground,
                borderColor: errors.confirmPassword ? 'rgb(239, 68, 68)' : styles.borderColor,
                color: styles.textColor
              }}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterAdmin; 