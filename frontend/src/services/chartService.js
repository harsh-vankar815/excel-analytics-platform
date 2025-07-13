import authService from './authService';

const { axiosInstance } = authService;

// Create chart
const createChart = async (chartData) => {
  const response = await axiosInstance.post('/charts', chartData);
  return response.data;
};

// Get all charts
const getCharts = async () => {
  const response = await axiosInstance.get('/charts');
  return response.data;
};

// Get chart by ID
const getChartById = async (id) => {
  const response = await axiosInstance.get(`/charts/${id}`);
  return response.data;
};

// Update chart
const updateChart = async (id, chartData) => {
  const response = await axiosInstance.put(`/charts/${id}`, chartData);
  return response.data;
};

// Delete chart
const deleteChart = async (id) => {
  const response = await axiosInstance.delete(`/charts/${id}`);
  return response.data;
};

// Get charts by file ID
const getChartsByFile = async (fileId) => {
  const response = await axiosInstance.get(`/charts/file/${fileId}`);
  return response.data;
};

// Get most viewed charts
const getMostViewedCharts = async () => {
  const response = await axiosInstance.get('/charts/most-viewed');
  return response.data;
};

// Generate AI insights for chart
const generateInsights = async (chartId) => {
  const response = await axiosInstance.post(`/ai/insights/chart/${chartId}`);
  return response.data;
};

// Export chart as image
const exportChart = async (chartId, format = 'png') => {
  const response = await axiosInstance.get(`/charts/${chartId}/export?format=${format}`, {
    responseType: 'blob'
  });
  return response.data;
};

const chartService = {
  createChart,
  getCharts,
  getChartById,
  updateChart,
  deleteChart,
  getChartsByFile,
  getMostViewedCharts,
  generateInsights,
  exportChart
};

export default chartService; 