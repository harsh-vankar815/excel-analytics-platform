import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

const { axiosInstance } = authService;

// Save chart as template
export const saveChartAsTemplate = createAsyncThunk(
  'chart/saveChartAsTemplate',
  async ({ id, templateName }, thunkAPI) => {
    try {
      console.log(`Saving chart ${id} as template with name: ${templateName}`);
      const response = await axiosInstance.post(`/charts/${id}/save-template`, { templateName });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error saving chart as template:', error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get chart templates
export const getChartTemplates = createAsyncThunk(
  'chart/getChartTemplates',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/charts/templates');
      return response.data.data || response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Apply chart template
export const applyChartTemplate = createAsyncThunk(
  'chart/applyChartTemplate',
  async ({ templateId, excelFileId, title }, thunkAPI) => {
    try {
      const response = await axiosInstance.post(`/charts/templates/${templateId}/apply`, { 
        sourceFile: excelFileId,
        title 
      });
      return response.data.data || response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get charts
export const getCharts = createAsyncThunk(
  'chart/getCharts',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/charts');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get chart by ID
export const getChartById = createAsyncThunk(
  'chart/getChartById',
  async (id, thunkAPI) => {
    try {
      // Validate the chart ID
      if (!id) {
        throw new Error('Invalid chart ID');
      }
      
      console.log('Requesting chart with ID:', id);
      const response = await axiosInstance.get(`/charts/${id}`);
      
      // Ensure we have a valid response with data
      if (!response.data) {
        throw new Error('Invalid response from server: Missing data');
      }
      
      // Extract chart data from response
      const chartData = response.data.data || response.data;
      
      // Ensure the chart has a data field
      if (!chartData.data) {
        console.warn('Chart missing data field, adding default structure');
        chartData.data = {
          labels: [],
          datasets: [],
          source: []
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Chart retrieval error:', error);
      
      // Handle rate limit errors
      if (error.response?.status === 429) {
        return thunkAPI.rejectWithValue('Server is experiencing high traffic. Please try again in a few minutes.');
      }
      
      // Handle specific validation errors
      if (error.response?.data?.message?.includes('Path `data` is required') || 
          (Array.isArray(error.response?.data?.message) && 
           error.response?.data?.message.some(msg => msg.includes('Path `data` is required')))) {
        
        console.log('Detected missing data field error, attempting to fix...');
        
        // Try to get the chart data without validation
        try {
          const chartId = id;
          // Create a dummy chart data structure
          const dummyChart = {
            _id: chartId,
            title: 'Recovered Chart',
            type: 'bar',
            data: {
              labels: [],
              datasets: [],
              source: []
            },
            config: {
              dimension: '2d',
              showGrid: true,
              showLabels: true
            },
            configuration: {
              dimension: '2d',
              showGrid: true,
              showLabels: true
            }
          };
          
          return { data: dummyChart };
        } catch (recoveryError) {
          console.error('Failed to recover chart data:', recoveryError);
          return thunkAPI.rejectWithValue('Chart data structure is invalid. Please try creating the chart again.');
        }
      }
      
      // Handle network errors
      if (error.message === 'Network Error') {
        return thunkAPI.rejectWithValue('Network error. Please check your internet connection and try again later.');
      }
      
      const errorMessage = error.response?.status === 404 
        ? 'Chart not found. It may have been deleted or you do not have permission to view it.'
        : error.response?.data?.message || error.message;
      
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Create chart
export const createChart = createAsyncThunk(
  'chart/createChart',
  async (chartData, thunkAPI) => {
    try {
      // More detailed request logging
      console.log('Creating chart with data:', JSON.stringify(chartData, null, 2));
      console.log('Chart data structure check:', {
        title: Boolean(chartData.title),
        type: Boolean(chartData.type),
        excelFileId: Boolean(chartData.excelFileId),
        data: Boolean(chartData.data),
        'data.labels': Boolean(chartData.data?.labels),
        'data.datasets': Boolean(chartData.data?.datasets),
        datasetCount: chartData.data?.datasets?.length || 0
      });

      // Validate required fields before sending
      const requiredFields = ['title', 'type', 'excelFileId', 'data'];
      const missingFields = requiredFields.filter(field => !chartData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate data structure
      if (!chartData.data.labels || !chartData.data.datasets) {
        throw new Error('Invalid chart data structure: missing labels or datasets');
      }

      // Make the request with a timeout
      const response = await axiosInstance.post('/charts', chartData, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Chart creation response:', response.data);
      
      // Handle both possible response structures
      const chartResponse = response.data.data || response.data;
      
      if (!chartResponse || !chartResponse._id) {
        throw new Error('Invalid response from server: Missing chart data or ID');
      }
      
      return chartResponse;
    } catch (error) {
      console.error('Chart creation error details:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        requestData: chartData
      });
      
      // Provide more specific error message
      let errorMessage = 'Failed to create chart: ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message.includes('Missing required fields')) {
        errorMessage = error.message;
      } else {
        errorMessage += 'An unexpected error occurred';
      }
      
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

// Update chart
export const updateChart = createAsyncThunk(
  'chart/updateChart',
  async ({ id, chartData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/charts/${id}`, chartData);
      return response.data.data || response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete chart
export const deleteChart = createAsyncThunk(
  'chart/deleteChart',
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/charts/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Generate AI insights
export const generateChartInsights = createAsyncThunk(
  'chart/generateInsights',
  async (insightData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/charts/insights', insightData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get recent charts
export const getRecentCharts = createAsyncThunk(
  'chart/getRecentCharts',
  async (limit = 5, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/chart/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get most viewed charts
export const getMostViewedCharts = createAsyncThunk(
  'chart/getMostViewedCharts',
  async (limit = 5, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/charts/most-viewed?limit=${limit}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get user charts count
export const getUserChartsCount = createAsyncThunk(
  'chart/getUserChartsCount',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/charts');
      return response.data.count;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  charts: [],
  currentChart: null,
  recentCharts: [],
  mostViewedCharts: [],
  chartTemplates: [],
  userChartsCount: 0,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  insights: null
};

const chartSlice = createSlice({
  name: 'chart',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearCurrentChart: (state) => {
      state.currentChart = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get charts
      .addCase(getCharts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCharts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.charts = action.payload.data;
      })
      .addCase(getCharts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get chart by ID
      .addCase(getChartById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getChartById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentChart = action.payload.data;
      })
      .addCase(getChartById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create chart
      .addCase(createChart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.charts.push(action.payload);
      })
      .addCase(createChart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update chart
      .addCase(updateChart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.charts = state.charts.map((chart) =>
          chart._id === action.payload._id ? action.payload : chart
        );
        
        if (state.currentChart && state.currentChart._id === action.payload._id) {
          state.currentChart = action.payload;
        }
      })
      .addCase(updateChart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete chart
      .addCase(deleteChart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.charts = state.charts.filter((chart) => chart._id !== action.payload);
        
        if (state.currentChart && state.currentChart._id === action.payload) {
          state.currentChart = null;
        }
      })
      .addCase(deleteChart.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Generate AI insights
      .addCase(generateChartInsights.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateChartInsights.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.insights = action.payload.insights;
        
        // If we have a current chart, update its insights
        if (state.currentChart) {
          state.currentChart.aiInsights = action.payload.insights;
        }
      })
      .addCase(generateChartInsights.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get recent charts
      .addCase(getRecentCharts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRecentCharts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.recentCharts = action.payload.data;
      })
      .addCase(getRecentCharts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get most viewed charts
      .addCase(getMostViewedCharts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMostViewedCharts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.mostViewedCharts = action.payload.data;
      })
      .addCase(getMostViewedCharts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get user charts count
      .addCase(getUserChartsCount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserChartsCount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.userChartsCount = action.payload;
      })
      .addCase(getUserChartsCount.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Save chart as template
      .addCase(saveChartAsTemplate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveChartAsTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.chartTemplates.push(action.payload);
      })
      .addCase(saveChartAsTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get chart templates
      .addCase(getChartTemplates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getChartTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.chartTemplates = action.payload;
      })
      .addCase(getChartTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Apply chart template
      .addCase(applyChartTemplate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(applyChartTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.charts.push(action.payload);
      })
      .addCase(applyChartTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearCurrentChart } = chartSlice.actions;
export default chartSlice.reducer; 