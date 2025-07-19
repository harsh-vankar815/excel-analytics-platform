import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://locahost:5000/api';

// Create axios instance with credentials
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to refresh token on each request
axiosInstance.interceptors.request.use(
  config => {
    // Get token from localStorage on each request
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  async error => {
    const originalRequest = error.config;
    
    // Handle rate limiting (429 Too Many Requests)
    if (error.response && error.response.status === 429) {
      console.warn('Rate limit hit. Implementing exponential backoff...');
      
      // Only retry if we haven't already retried 3 times
      if (!originalRequest._retry || originalRequest._retry < 3) {
        originalRequest._retry = (originalRequest._retry || 0) + 1;
        
        // Exponential backoff with jitter
        const delay = Math.min(1000 * (2 ** originalRequest._retry) + Math.random() * 1000, 10000);
        console.log(`Retrying request after ${delay}ms (attempt ${originalRequest._retry})`);
        
        return new Promise(resolve => {
          setTimeout(() => resolve(axiosInstance(originalRequest)), delay);
        });
      }
      
      // If we've retried 3 times, give up and return a more helpful error
      error.message = 'Server is experiencing high traffic. Please try again in a few minutes.';
    }
    
    return Promise.reject(error);
  }
);

// Register user
const register = async (userData) => {
  const response = await axiosInstance.post('/auth/register', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
    addAuthToken(response.data.token);
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axiosInstance.post('/auth/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
    addAuthToken(response.data.token);
  }
  return response.data;
};

// Google OAuth login
const googleLogin = () => {
  window.location.href = `${API_URL}/auth/google`;
};

// Handle OAuth callback
const handleOAuthCallback = async (token) => {
  try {
    if (token) {
      localStorage.setItem('token', token);
      addAuthToken(token);
      const user = await getCurrentUser();
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
};

// Logout user
const logout = async () => {
  await axiosInstance.get('/auth/logout');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  removeAuthToken();
};

// Get current user
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    addAuthToken(token);
  }
  const response = await axiosInstance.get('/auth/me');
  return response.data.data;
};

// Update profile
const updateProfile = async (userData) => {
  const response = await axiosInstance.put('/auth/update-profile', userData);
  
  if (response.data && response.data.data) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
    return response.data.data;
  }
  return response.data.data;
};

// Forgot password
const forgotPassword = async (userData) => {
  const response = await axiosInstance.post('/auth/forgot-password', userData);
  return response.data;
};

// Reset password
const resetPassword = async (token, password) => {
  const response = await axiosInstance.put(`/auth/reset-password/${token}`, { password });
  return response.data;
};

// Admin login
const adminLogin = async (userData) => {
  const response = await axiosInstance.post('/auth/admin/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('token', response.data.token);
    addAuthToken(response.data.token);
  }
  return response.data;
};

// Register admin
const registerAdmin = async (userData) => {
  const response = await axiosInstance.post('/auth/admin/register', userData);
  return response.data;
};

// Add auth token to axios instance
const addAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Remove auth token from axios instance
const removeAuthToken = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
};

// Initialize axios with token if it exists
const token = localStorage.getItem('token');
if (token) {
  addAuthToken(token);
}

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  googleLogin,
  handleOAuthCallback,
  forgotPassword,
  resetPassword,
  adminLogin,
  registerAdmin,
  axiosInstance
};

export default authService; 