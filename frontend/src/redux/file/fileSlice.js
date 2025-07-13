import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fileService from '../../services/fileService';
import { toast } from 'react-toastify';

const initialState = {
  files: [],
  file: null,
  recentFiles: [],
  mostViewedFiles: [],
  fileSummary: null,
  isLoading: false,
  error: null
};

// Upload Excel file
export const uploadFile = createAsyncThunk(
  'file/upload',
  async (fileData, thunkAPI) => {
    try {
      const response = await fileService.uploadFile(fileData);
      toast.success('File uploaded successfully');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'File upload failed';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get all files
export const getFiles = createAsyncThunk(
  'file/getAll',
  async (_, thunkAPI) => {
    try {
      return await fileService.getFiles();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch files';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get file by ID
export const getFile = createAsyncThunk(
  'file/getById',
  async (id, thunkAPI) => {
    try {
      return await fileService.getFileById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch file';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete file
export const deleteFile = createAsyncThunk(
  'file/delete',
  async (id, thunkAPI) => {
    try {
      await fileService.deleteFile(id);
      toast.success('File deleted successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete file';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get recent files
export const getRecentFiles = createAsyncThunk(
  'file/getRecent',
  async (_, thunkAPI) => {
    try {
      return await fileService.getRecentFiles();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch recent files';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get most viewed files
export const getMostViewedFiles = createAsyncThunk(
  'file/getMostViewed',
  async (_, thunkAPI) => {
    try {
      return await fileService.getMostViewedFiles();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch most viewed files';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Generate AI summary for a file
export const generateFileSummary = createAsyncThunk(
  'file/generateSummary',
  async (id, thunkAPI) => {
    try {
      const response = await fileService.generateFileSummary(id);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to generate AI summary';
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    reset: (state) => {
      state.files = [];
      state.file = null;
      state.recentFiles = [];
      state.mostViewedFiles = [];
      state.fileSummary = null;
      state.isLoading = false;
      state.error = null;
    },
    clearFile: (state) => {
      state.file = null;
    },
    clearFileSummary: (state) => {
      state.fileSummary = null;
    },
    setFileSummary: (state, action) => {
      state.fileSummary = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files.unshift(action.payload.data);
        state.file = action.payload.data;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get all files
      .addCase(getFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = action.payload.data;
      })
      .addCase(getFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get file by ID
      .addCase(getFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.file = action.payload.data;
      })
      .addCase(getFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete file
      .addCase(deleteFile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.files = state.files.filter(file => file._id !== action.payload);
        if (state.file && state.file._id === action.payload) {
          state.file = null;
        }
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get recent files
      .addCase(getRecentFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRecentFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentFiles = action.payload.data;
      })
      .addCase(getRecentFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get most viewed files
      .addCase(getMostViewedFiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMostViewedFiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mostViewedFiles = action.payload.data;
      })
      .addCase(getMostViewedFiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Generate AI summary
      .addCase(generateFileSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateFileSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data && action.payload.data.summary) {
          state.fileSummary = action.payload.data.summary;
          // Also update the file's aiSummary if we have the file in state
          if (state.file && state.file._id === action.payload.data.fileId) {
            state.file.aiSummary = action.payload.data.summary;
          }
        }
      })
      .addCase(generateFileSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { reset, clearFile, clearFileSummary, setFileSummary } = fileSlice.actions;
export default fileSlice.reducer; 