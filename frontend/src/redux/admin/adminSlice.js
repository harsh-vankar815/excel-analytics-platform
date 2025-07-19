import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api-excel-analytics.onrender.com/api';

// User management thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (userId, { rejectWithValue }) => {
    // Validate userId before making the API call
    if (!userId || userId === 'undefined') {
      return rejectWithValue('Invalid user ID provided');
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, status }, { rejectWithValue }) => {
    // Validate userId before making the API call
    if (!userId || userId === 'undefined') {
      return rejectWithValue('Invalid user ID provided');
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user status');
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user role');
    }
  }
);

export const updateUserLimits = createAsyncThunk(
  'admin/updateUserLimits',
  async ({ userId, limits }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/admin/users/${userId}/limits`,
        limits,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user limits');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// Content management thunks
export const fetchContent = createAsyncThunk(
  'admin/fetchContent',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(params).toString();
      const response = await axios.get(`${API_URL}/admin/content?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch content');
    }
  }
);

export const updateContentStatus = createAsyncThunk(
  'admin/updateContentStatus',
  async ({ contentId, status, contentType }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/admin/content/${contentId}/status`,
        { status, contentType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update content status');
    }
  }
);

export const deleteContent = createAsyncThunk(
  'admin/deleteContent',
  async ({ contentId, contentType }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/content/${contentId}?contentType=${contentType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { contentId, contentType };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete content');
    }
  }
);

// Statistics and activity thunks
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (timeRange = 'week', { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Make sure timeRange is a valid value
      const validRanges = ['week', 'month', 'year', 'all'];
      const validTimeRange = validRanges.includes(timeRange) ? timeRange : 'week';
      
      const response = await axios.get(`${API_URL}/admin/stats?timeRange=${validTimeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add a debugging log if data isn't as expected
      if (!response.data.data.activityChart || response.data.data.activityChart.length === 0) {
        console.warn('No activity chart data received from API');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin statistics');
    }
  }
);

export const fetchActivityLogs = createAsyncThunk(
  'admin/fetchActivityLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      // Clean up params by removing any undefined or 'undefined' string values
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== 'undefined' && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const queryParams = new URLSearchParams(cleanParams).toString();
      const response = await axios.get(`${API_URL}/admin/activity?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'admin/fetchUserActivity',
  async (userId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/activity?user=${userId}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user activity');
    }
  }
);

// System settings thunks
export const fetchSystemSettings = createAsyncThunk(
  'admin/fetchSystemSettings',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system settings');
    }
  }
);

export const updateSystemSettings = createAsyncThunk(
  'admin/updateSystemSettings',
  async (settings, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/admin/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update system settings');
    }
  }
);

// Role management thunks
export const fetchRoles = createAsyncThunk(
  'admin/fetchRoles',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles');
    }
  }
);

export const createRole = createAsyncThunk(
  'admin/createRole',
  async (roleData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/admin/roles`,
        roleData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create role');
    }
  }
);

export const updateRole = createAsyncThunk(
  'admin/updateRole',
  async ({ roleId, roleData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/admin/roles/${roleId}`,
        roleData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role');
    }
  }
);

export const deleteRole = createAsyncThunk(
  'admin/deleteRole',
  async (roleId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return roleId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete role');
    }
  }
);

export const updatePermissions = createAsyncThunk(
  'admin/updatePermissions',
  async ({ roleId, permissions }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/admin/roles/${roleId}/permissions`,
        { permissions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update permissions');
    }
  }
);

const initialState = {
  users: [],
  selectedUser: null,
  userActivity: [],
  content: [],
  contentTotalCount: 0,
  stats: null,
  activityLogs: [],
  activityTotalCount: 0,
  systemSettings: null,
  roles: [],
  selectedRole: null,
  loading: false,
  error: null
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    clearSelectedRole: (state) => {
      state.selectedRole = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateUserStatus
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the user in the users array
        const updatedUser = action.payload.data;
        state.users = state.users.map(user => 
          user._id === updatedUser._id ? updatedUser : user
        );
        // Update selectedUser if it's the user that was updated
        if (state.selectedUser && state.selectedUser._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // updateUserRole
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        // Update the user in the users array
        const updatedUser = action.payload.data;
        state.users = state.users.map(user => 
          user._id === updatedUser._id ? updatedUser : user
        );
        // Update selectedUser if it's the user that was updated
        if (state.selectedUser && state.selectedUser._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateUserLimits
      .addCase(updateUserLimits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserLimits.fulfilled, (state, action) => {
        state.loading = false;
        // Update the user in the users array
        const updatedUser = action.payload.data;
        state.users = state.users.map(user => 
          user._id === updatedUser._id ? updatedUser : user
        );
        // Update selectedUser if it's the user that was updated
        if (state.selectedUser && state.selectedUser._id === updatedUser._id) {
          state.selectedUser = updatedUser;
        }
      })
      .addCase(updateUserLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // deleteUser
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the user from the users array
        state.users = state.users.filter(user => user._id !== action.payload);
        // Clear selectedUser if it's the user that was deleted
        if (state.selectedUser && state.selectedUser._id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchContent
      .addCase(fetchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.content = action.payload.data;
        state.contentTotalCount = action.payload.count;
        state.loading = false;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateContentStatus
      .addCase(updateContentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateContentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedContent = action.payload.data;
        state.content = state.content.map(item => 
          item._id === updatedContent._id ? updatedContent : item
        );
      })
      .addCase(updateContentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteContent
      .addCase(deleteContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteContent.fulfilled, (state, action) => {
        state.loading = false;
        const { contentId } = action.payload;
        state.content = state.content.filter(item => item._id !== contentId);
        state.contentTotalCount = Math.max(0, state.contentTotalCount - 1);
      })
      .addCase(deleteContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // fetchAdminStats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchActivityLogs
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.activityLogs = action.payload.data;
        state.activityTotalCount = action.payload.count;
        state.loading = false;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchUserActivity
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.userActivity = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchSystemSettings
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.systemSettings = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateSystemSettings
      .addCase(updateSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.systemSettings = action.payload.data;
        state.loading = false;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchRoles
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.roles = action.payload.data;
        state.loading = false;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createRole
      .addCase(createRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.roles = [...state.roles, action.payload.data];
        state.loading = false;
      })
      .addCase(createRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateRole
      .addCase(updateRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.roles = state.roles.map(role => 
          role._id === action.payload.data._id ? action.payload.data : role
        );
        if (state.selectedRole && state.selectedRole._id === action.payload.data._id) {
          state.selectedRole = action.payload.data;
        }
        state.loading = false;
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteRole
      .addCase(deleteRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.roles = state.roles.filter(role => role._id !== action.payload);
        if (state.selectedRole && state.selectedRole._id === action.payload) {
          state.selectedRole = null;
        }
        state.loading = false;
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updatePermissions
      .addCase(updatePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePermissions.fulfilled, (state, action) => {
        state.roles = state.roles.map(role => 
          role._id === action.payload.data._id ? action.payload.data : role
        );
        if (state.selectedRole && state.selectedRole._id === action.payload.data._id) {
          state.selectedRole = action.payload.data;
        }
        state.loading = false;
      })
      .addCase(updatePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { setSelectedRole, clearSelectedRole } = adminSlice.actions;
export default adminSlice.reducer; 