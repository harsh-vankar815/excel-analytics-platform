import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { toast } from 'react-toastify';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user || null,
  isAuthenticated: !!user,
  isLoading: false,
  error: null
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.register(userData);
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.login(userData);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Google OAuth login
export const googleOAuthLogin = createAsyncThunk(
  'auth/googleOAuthLogin',
  async (token, thunkAPI) => {
    try {
      if (!token) {
        authService.googleLogin();
        return null;
      }

      const user = await authService.handleOAuthCallback(token);
      toast.success('Google login successful!');
      return { user };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Google login failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Admin login
export const adminLogin = createAsyncThunk(
  'auth/adminLogin',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.adminLogin(userData);
      toast.success('Admin login successful!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Admin login failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Register admin
export const registerAdmin = createAsyncThunk(
  'auth/registerAdmin',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.registerAdmin(userData);
      toast.success('Admin registered successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Admin registration failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, thunkAPI) => {
    try {
      const response = await authService.forgotPassword(email);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send reset email';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, thunkAPI) => {
    try {
      const response = await authService.resetPassword(token, password);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password reset failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Logout failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Load user
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, thunkAPI) => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      // Don't show error toast for auth check
      return thunkAPI.rejectWithValue('Session expired');
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const response = await authService.updateProfile(userData);
      toast.success('Profile updated successfully');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Profile update failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Google OAuth login
      .addCase(googleOAuthLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleOAuthLogin.fulfilled, (state, action) => {
        if (action.payload) {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
      })
      .addCase(googleOAuthLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Admin login
      .addCase(adminLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register admin
      .addCase(registerAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { reset } = authSlice.actions;
export default authSlice.reducer; 