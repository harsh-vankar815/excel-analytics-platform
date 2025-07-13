import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRecentFiles, getMostViewedFiles } from '../redux/file/fileSlice';
import { getMostViewedCharts, getChartTemplates, getUserChartsCount } from '../redux/chart/chartSlice';
import Spinner from '../components/ui/Spinner';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea, Scatter, Bubble } from 'react-chartjs-2';
import ChartPreview3D from '../components/charts/ChartPreview3D';
import { useTheme } from '../contexts/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  PolarAreaController,
  RadarController,
  ScatterController,
  BarController,
  BubbleController
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  PolarAreaController,
  RadarController,
  ScatterController,
  BarController,
  BubbleController
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { recentFiles, mostViewedFiles, isLoading: filesLoading } = useSelector((state) => state.file);
  const { mostViewedCharts, chartTemplates, userChartsCount, isLoading: chartsLoading } = useSelector((state) => state.chart);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    dispatch(getRecentFiles());
    dispatch(getMostViewedFiles());
    dispatch(getMostViewedCharts());
    dispatch(getChartTemplates());
    dispatch(getUserChartsCount());
  }, [dispatch]);

  // Function to prepare chart data for preview
  const prepareChartData = (chart) => {
    try {
      if (!chart) return null;
      
      // Check if data is directly in chart.data
      if (chart.data && typeof chart.data === 'object') {
        // If chart.data has labels and datasets properties
        if (chart.data.labels && chart.data.datasets) {
          return chart.data;
        }
        
        // If chart.data is the configuration object
        if (chart.data.data && chart.data.data.labels && chart.data.data.datasets) {
          return chart.data.data;
        }
      }
      
      // Check if data is in configuration
      if (chart.configuration && typeof chart.configuration === 'object') {
        // If configuration has data property with labels and datasets
        if (chart.configuration.data && chart.configuration.data.labels && chart.configuration.data.datasets) {
          return chart.configuration.data;
        }
        
        // If configuration directly has labels and datasets
        if (chart.configuration.labels && chart.configuration.datasets) {
          return {
            labels: chart.configuration.labels,
            datasets: chart.configuration.datasets
          };
        }
      }
      
      // Check if data is in config property
      if (chart.config && typeof chart.config === 'object') {
        // If config has data property with labels and datasets
        if (chart.config.data && chart.config.data.labels && chart.config.data.datasets) {
          return chart.config.data;
        }
        
        // If config directly has labels and datasets
        if (chart.config.labels && chart.config.datasets) {
          return {
            labels: chart.config.labels,
            datasets: chart.config.datasets
          };
        }
      }
      
      // Try to reconstruct from xAxis and yAxis
      if (chart.xAxis || chart.yAxis) {
        // Extract labels from xAxis with fallbacks
        let labels = [];
        if (chart.xAxis) {
          if (Array.isArray(chart.xAxis.data)) {
            labels = chart.xAxis.data;
          } else if (Array.isArray(chart.xAxis.values)) {
            labels = chart.xAxis.values;
          } else if (Array.isArray(chart.xAxis)) {
            labels = chart.xAxis;
          } else if (chart.labels && Array.isArray(chart.labels)) {
            labels = chart.labels;
          } else {
            // Generate default labels if none found
            labels = Array(5).fill(0).map((_, i) => `Item ${i+1}`);
          }
        } else {
          // No xAxis defined, try other sources or create default
          if (chart.labels && Array.isArray(chart.labels)) {
            labels = chart.labels;
          } else {
            // Generate default labels
            labels = Array(5).fill(0).map((_, i) => `Item ${i+1}`);
          }
        }
        
        // Handle different yAxis formats
        let datasets = [];
        if (chart.yAxis) {
          const colors = [
            '#60A5FA', '#34D399', '#F97316', '#A78BFA', '#EC4899', '#06B6D4',
            '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#0EA5E9'
          ];
          
          if (Array.isArray(chart.yAxis)) {
            datasets = chart.yAxis.map((axis, index) => {
              const color = colors[index % colors.length];
              
              // Get data from various possible locations
              let data = [];
              if (Array.isArray(axis.data)) {
                data = axis.data;
              } else if (Array.isArray(axis.values)) {
                data = axis.values;
              } else if (typeof axis === 'string' && chart.data && Array.isArray(chart.data[axis])) {
                data = chart.data[axis];
              } else if (typeof axis === 'string' && chart.source && Array.isArray(chart.source)) {
                // Try to extract from source data if it's an array of objects
                data = chart.source.map(item => parseFloat(item[axis]) || 0);
              } else {
                // Generate random data as fallback
                data = Array(labels.length).fill(0).map(() => Math.floor(Math.random() * 50) + 10);
              }
              
              return {
                label: axis.label || axis.field || (typeof axis === 'string' ? axis : `Dataset ${index + 1}`),
                data: data,
                borderColor: color,
                backgroundColor: `${color}80`
              };
            });
          } else if (chart.yAxis && (chart.yAxis.data || chart.yAxis.values || chart.yAxis.field)) {
            const color = '#60A5FA';
            let data = [];
            
            if (Array.isArray(chart.yAxis.data)) {
              data = chart.yAxis.data;
            } else if (Array.isArray(chart.yAxis.values)) {
              data = chart.yAxis.values;
            } else if (chart.yAxis.field && chart.data && Array.isArray(chart.data[chart.yAxis.field])) {
              data = chart.data[chart.yAxis.field];
            } else if (chart.yAxis.field && chart.source && Array.isArray(chart.source)) {
              // Try to extract from source data if it's an array of objects
              data = chart.source.map(item => parseFloat(item[chart.yAxis.field]) || 0);
            } else {
              // Generate random data as fallback
              data = Array(labels.length).fill(0).map(() => Math.floor(Math.random() * 50) + 10);
            }
            
            datasets = [{
              label: chart.yAxis.label || chart.yAxis.field || 'Dataset',
              data: data,
              borderColor: color,
              backgroundColor: `${color}80`
            }];
          } else if (typeof chart.yAxis === 'string') {
            // Handle case where yAxis is just a string field name
            const color = '#60A5FA';
            let data = [];
            
            if (chart.data && Array.isArray(chart.data[chart.yAxis])) {
              data = chart.data[chart.yAxis];
            } else if (chart.source && Array.isArray(chart.source)) {
              // Try to extract from source data if it's an array of objects
              data = chart.source.map(item => parseFloat(item[chart.yAxis]) || 0);
            } else {
              // Generate random data as fallback
              data = Array(labels.length).fill(0).map(() => Math.floor(Math.random() * 50) + 10);
            }
            
            datasets = [{
              label: chart.yAxis,
              data: data,
              borderColor: color,
              backgroundColor: `${color}80`
            }];
          }
        }
        
        // If no datasets were created, create a default one
        if (datasets.length === 0) {
          datasets = [{
            label: 'Dataset',
            data: Array(labels.length).fill(0).map(() => Math.floor(Math.random() * 50) + 10),
            borderColor: '#60A5FA',
            backgroundColor: '#60A5FA80'
          }];
        }
        
        return {
          labels,
          datasets
        };
      }
      
      // Check if we have source data we can use
      if (chart.source && Array.isArray(chart.source)) {
        // Try to extract data from source array
        const labels = chart.source.map((item, index) => {
          if (item.category) return item.category;
          if (item.label) return item.label;
          if (item.name) return item.name;
          if (item.x) return item.x;
          return `Item ${index + 1}`;
        });
        
        const datasets = [{
          label: 'Value',
          data: chart.source.map(item => {
            if (item.value !== undefined) return parseFloat(item.value);
            if (item.y !== undefined) return parseFloat(item.y);
            // Get first numeric property
            for (const key in item) {
              const val = parseFloat(item[key]);
              if (!isNaN(val)) return val;
            }
            return 0;
          }),
          borderColor: '#60A5FA',
          backgroundColor: '#60A5FA80'
        }];
        
        return {
          labels,
          datasets
        };
      }
      
      // Default empty data
      return { 
        labels: ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'],
        datasets: [{
          label: 'Sample Data',
          data: [25, 45, 30, 60, 20],
          backgroundColor: [
            'rgba(96, 165, 250, 0.5)',
            'rgba(52, 211, 153, 0.5)',
            'rgba(249, 115, 22, 0.5)',
            'rgba(167, 139, 250, 0.5)',
            'rgba(236, 72, 153, 0.5)'
          ],
          borderColor: [
            'rgba(96, 165, 250, 1)',
            'rgba(52, 211, 153, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(167, 139, 250, 1)',
            'rgba(236, 72, 153, 1)'
          ],
          borderWidth: 1
        }]
      };
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return { 
        labels: ['Error', 'Loading', 'Data'],
        datasets: [{
          label: 'Error',
          data: [30, 50, 20],
          backgroundColor: 'rgba(255, 99, 132, 0.5)'
        }]
      };
    }
  };
  
  // Function to render the appropriate chart preview component
  const renderChartPreview = (chart) => {
    const chartData = prepareChartData(chart);
    
    if (!chartData || !chartData.labels || !chartData.datasets) {
      return (
        <div className="flex items-center justify-center h-full">
          <span style={{ color: styles.secondaryColor }}>No preview available</span>
        </div>
      );
    }
    
    // Check for 3D chart types first
    if (chart.type && chart.type.includes('3d')) {
      // Extract the base chart type by removing the '3d-' prefix
      const baseChartType = chart.type.replace('3d-', '');
      
      // Only render 3D previews for specific chart types
      const supported3DTypes = ['column', 'bar', 'scatter', 'line', 'bubble', 'surface', 'heatmap', 'waterfall'];
      
      if (supported3DTypes.includes(baseChartType)) {
        return (
          <div className="w-full h-full" style={{ position: 'relative' }}>
            <ChartPreview3D 
              data={(() => {
                // Try to use existing data if available
                const existingData = chart.data?.source || 
                  chart.config?.source || 
                  chart.configuration?.source ||
                  chart.data ||
                  chart.config ||
                  chart.configuration;
                
                if (existingData) return existingData;
                
                // Generate appropriate sample data based on chart type
                const sampleData = [];
                for (let i = 0; i < 5; i++) {
                  let value;
                  
                  // Generate different data patterns based on chart type
                  switch(baseChartType) {
                    case 'column':
                      // Column chart - regular increasing values
                      value = 20 + (i * 10);
                      break;
                    case 'bar':
                      // Bar chart - alternating high-low values
                      value = i % 2 === 0 ? 50 : 20;
                      break;
                    case 'scatter':
                      // Scatter - random values
                      value = Math.floor(Math.random() * 50) + 10;
                      break;
                    case 'line':
                      // Line - sine wave pattern
                      value = 30 + Math.sin(i * 0.8) * 20;
                      break;
                    case 'bubble':
                      // Bubble - quadratic growth
                      value = 10 + (i * i * 3);
                      break;
                    case 'surface':
                      // Surface - varied values
                      value = 30 + (i * 5) + (i % 3 === 0 ? 15 : 0);
                      break;
                    case 'heatmap':
                      // Heatmap - clustered values
                      value = (i < 2) ? 15 + i * 5 : 35 + i * 5;
                      break;
                    case 'waterfall':
                      // Waterfall - alternating positive/negative changes
                      value = 30 + (i % 2 === 0 ? 10 * i : -5 * i);
                      break;
                    default:
                      value = Math.floor(Math.random() * 50) + 20;
                  }
                  
                  sampleData.push({
                    category: `Category ${i+1}`,
                    value: value,
                    label: `Label ${i+1}`
                  });
                }
                return sampleData;
              })()}
              chartType={baseChartType}
              selectedColumns={{
                x: chart.xAxis?.field || chart.xAxis || 'category',
                y: Array.isArray(chart.yAxis) 
                   ? chart.yAxis.map(y => y.field || y) 
                   : [chart.yAxis?.field || chart.yAxis || 'value'],
                z: chart.zAxis?.field || chart.zAxis
              }}
            />
          </div>
        );
      } else {
        // For unsupported 3D chart types
        return (
          <div className="flex items-center justify-center h-full">
            <span style={{ color: styles.secondaryColor }}>3D Preview Not Available</span>
          </div>
        );
      }
    }
    
    // Handle 2D chart types
    switch (chart.type) {
      case 'bar':
        return <Bar data={chartData} />;
      case 'horizontalBar':
        return <Bar data={chartData} />;
      case 'stackedBar':
        return <Bar data={chartData} />;
      case 'line':
        return <Line data={chartData} />;
      case 'pie':
        return <Pie data={chartData} />;
      case 'doughnut':
        return <Doughnut data={chartData} />;
      case 'radar':
        return <Radar data={chartData} />;
      case 'polarArea':
        return <PolarArea data={chartData} />;
      case 'scatter':
        // Transform data for scatter chart if needed
        const scatterData = {
          ...chartData,
          datasets: chartData.datasets.map(dataset => {
            // Add x,y coordinates if not present
            if (!dataset.data.some(item => item && item.x !== undefined)) {
              return {
                ...dataset,
                data: dataset.data.map((value, i) => ({
                  x: i,
                  y: typeof value === 'number' ? value : 0
                }))
              };
            }
            return dataset;
          })
        };
        return <Scatter data={scatterData} />;
      case 'bubble':
        // Transform data for bubble chart if needed
        const bubbleData = {
          ...chartData,
          datasets: chartData.datasets.map(dataset => {
            // Add radius (r) value if not present
            if (!dataset.data.some(item => item && item.r)) {
              return {
                ...dataset,
                data: dataset.data.map((value, i) => ({
                  x: i,
                  y: typeof value === 'number' ? value : 0,
                  r: Math.max(4, Math.min(10, (typeof value === 'number' ? value : 0) / 5))
                }))
              };
            }
            return dataset;
          })
        };
        return <Bubble data={bubbleData} />;
      case 'area':
        // Add fill property to create area chart
        return <Line data={{
          ...chartData,
          datasets: chartData.datasets.map(dataset => ({
            ...dataset,
            fill: true
          }))
        }} />;
      case 'mixed':
        // For mixed charts, use Bar as base but modify datasets
        const mixedData = {
          ...chartData,
          datasets: chartData.datasets.map((dataset, index) => {
            // Alternate between bar and line types
            if (index % 2 === 0) {
              return { ...dataset, type: 'bar' };
            } else {
              return { ...dataset, type: 'line', fill: false };
            }
          })
        };
        return <Bar data={mixedData} />;
      default:
        // For unknown chart types, try to map them to known types
        if (chart.type === 'column') {
          return <Bar data={chartData} />;
        } else if (chart.type && chart.type.includes('bar')) {
          return <Bar data={chartData} />;
        } else if (chart.type && chart.type.includes('line')) {
          return <Line data={chartData} />;
        } else if (chart.type && chart.type.includes('pie')) {
          return <Pie data={chartData} />;
        } else if (chart.type && chart.type.includes('doughnut')) {
          return <Doughnut data={chartData} />;
        } else if (chart.type && chart.type.includes('radar')) {
          return <Radar data={chartData} />;
        }
        
        // Final fallback
        return (
          <div className="flex items-center justify-center h-full">
            <span style={{ color: styles.secondaryColor }}>Chart Preview</span>
          </div>
        );
    }
  };

  const isLoading = filesLoading || chartsLoading;

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <h1 style={{
          color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
        }} className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
        <Link
          to="/app/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium sm:text-base flex items-center shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Upload New File
        </Link>
      </div>

      {/* Welcome message */}
      <div style={{
        // backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: `0 1px 3px ${styles.shadowColor}`,
        border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
        }}>
          Welcome, {user?.name}!
        </h2>
        <p style={{
          color: theme === 'dark' ? '#d1d5db' : '#4b5563',
        }}>
          This is your Excel Analytics dashboard. Upload Excel files, create visualizations, and gain insights from your data.
        </p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: `0 1px 3px ${styles.shadowColor}`,
          border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
          transition: 'box-shadow 0.3s ease',
        }} className="hover:shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div className="ml-5">
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500',
                color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
              }}>Recent Files</h3>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: theme === 'dark' ? '#f3f4f6' : '#111827',
              }}>{recentFiles.length}</p>
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: `0 1px 3px ${styles.shadowColor}`,
          border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
          transition: 'box-shadow 0.3s ease',
        }} className="hover:shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
              </svg>
            </div>
            <div className="ml-5">
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500',
                color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
              }}>Created Charts</h3>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: theme === 'dark' ? '#f3f4f6' : '#111827',
              }}>{userChartsCount}</p>
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: `0 1px 3px ${styles.shadowColor}`,
          border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
          transition: 'box-shadow 0.3s ease',
        }} className="hover:shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div className="ml-5">
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500',
                color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
              }}>Popular Files</h3>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: theme === 'dark' ? '#f3f4f6' : '#111827',
              }}>{mostViewedFiles.length}</p>
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: `0 1px 3px ${styles.shadowColor}`,
          border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
          transition: 'box-shadow 0.3s ease',
        }} className="hover:shadow-lg">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <div className="ml-5">
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '500',
                color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
              }}>Saved Templates</h3>
              <p style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                color: theme === 'dark' ? '#f3f4f6' : '#111827',
              }}>{chartTemplates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload History Section */}
      <div style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: `0 1px 3px ${styles.shadowColor}`,
        border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
      }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
          }}>Upload History</h2>
          {recentFiles.length > 0 && (
            <Link to="/app/files" style={{
              color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginTop: '0.5rem',
            }} className="hover:text-blue-800 dark:hover:text-blue-300 sm:mt-0">
              View all files →
            </Link>
          )}
        </div>
        {recentFiles.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0 sm:px-6">
            <div className="inline-block min-w-full align-middle">
              <table style={{
                minWidth: '100%',
                borderCollapse: 'separate',
                borderSpacing: 0,
              }} className="divide-y divide-gray-200 dark:divide-gray-700">
                <thead style={{
                  backgroundColor: theme === 'dark' ? '#374151' : styles.tableHeaderBackground,
                }}>
                  <tr>
                    <th style={{
                      padding: '0.75rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    }} scope="col">Name</th>
                    <th style={{
                      padding: '0.75rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    }} scope="col" className="hidden sm:table-cell">Size</th>
                    <th style={{
                      padding: '0.75rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    }} scope="col" className="hidden sm:table-cell">Uploaded</th>
                    <th style={{
                      padding: '0.75rem 1.5rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: theme === 'dark' ? '#d1d5db' : '#6b7280',
                    }} scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
                }} className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentFiles.map((file) => (
                    <tr key={file._id} style={{
                      transition: 'background-color 0.15s ease',
                    }} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : styles.tableRowHoverBackground;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                      <td style={{
                        padding: '1rem 1.5rem',
                        whiteSpace: 'nowrap',
                      }}>
                        <div className="flex items-center">
                          <svg style={{
                            flexShrink: 0,
                            height: '1.25rem',
                            width: '1.25rem',
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                          }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <div className="ml-4">
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: theme === 'dark' ? '#f3f4f6' : '#111827',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }} className="sm:max-w-xs">{file.originalName}</div>
                            <div style={{
                              fontSize: '0.75rem',
                              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            }} className="hidden sm:block">{file.sheets?.length || 0} sheets</div>
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: '1rem 1.5rem',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      }} className="hidden sm:table-cell">
                        {(file.size / 1024).toFixed(2)} KB
                      </td>
                      <td style={{
                        padding: '1rem 1.5rem',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                      }} className="hidden sm:table-cell">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{
                        padding: '1rem 1.5rem',
                        whiteSpace: 'nowrap',
                        fontSize: '0.875rem',
                      }}>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                          <Link to={`/app/files/${file._id}`} style={{
                            color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
                            fontWeight: '500',
                          }} className="hover:text-blue-900 dark:hover:text-blue-300">View</Link>
                          <Link to={`/app/charts/create/${file._id}`} style={{
                            color: theme === 'dark' ? '#34d399' : '#10b981',
                            fontWeight: '500',
                          }} className="hover:text-green-900 dark:hover:text-green-300">Create Chart</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p style={{
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          }}>No files uploaded yet. Upload your first Excel file to get started.</p>
        )}
      </div>

      {/* Analysis Results Section */}
      <div style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: `0 1px 3px ${styles.shadowColor}`,
        border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
      }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
          }}>Recent Analysis</h2>
          {mostViewedCharts.length > 0 && (
            <Link to="/app/charts" style={{
              color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
              fontSize: '0.875rem',
              fontWeight: '500',
              marginTop: '0.5rem',
            }} className="hover:text-blue-800 dark:hover:text-blue-300 sm:mt-0">
              View all charts →
            </Link>
          )}
        </div>
        {mostViewedCharts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mostViewedCharts.map((chart) => (
              <div key={chart._id} style={{
                border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: `0 1px 2px ${styles.shadowColor}`,
                transition: 'box-shadow 0.2s ease',
              }} className="hover:shadow-md">
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    marginBottom: '0.25rem',
                    color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>{chart.title}</h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.75rem',
                  }}>Type: {chart.type}</p>
                  <div style={{
                    height: '10rem',
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {renderChartPreview(chart)}
                  </div>
                  <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    }}>{chart.viewCount} views</span>
                    <Link to={`/app/charts/${chart._id}`} style={{
                      color: theme === 'dark' ? '#60a5fa' : '#3b82f6',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }} className="hover:text-blue-800 dark:hover:text-blue-300">
                      View Chart →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          }}>No charts created yet. Upload a file and create your first chart.</p>
        )}
      </div>

      {/* Saved Chart Templates Section */}
      <div style={{
        backgroundColor: theme === 'dark' ? '#1f2937' : styles.cardBackground,
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: `0 1px 3px ${styles.shadowColor}`,
        border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
      }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
          }}>Saved Chart Templates</h2>
        </div>
        {chartTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {chartTemplates.map((template) => (
              <div key={template._id} style={{
                border: `1px solid ${theme === 'dark' ? '#374151' : styles.borderColor}`,
                borderRadius: '0.5rem',
                overflow: 'hidden',
                boxShadow: `0 1px 2px ${styles.shadowColor}`,
                transition: 'box-shadow 0.2s ease',
              }} className="hover:shadow-md">
                <div style={{ padding: '1.25rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '500',
                      color: theme === 'dark' ? '#f3f4f6' : styles.textColor,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{template.templateName || template.title}</h3>
                    <span style={{
                      backgroundColor: theme === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                      color: theme === 'dark' ? '#93c5fd' : '#1e40af',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      padding: '0.125rem 0.625rem',
                      borderRadius: '0.25rem',
                    }}>
                      Template
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                    marginBottom: '0.75rem',
                  }}>Type: {template.type}</p>
                  <div style={{
                    height: '8rem',
                    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
                    borderRadius: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                  }}>
                    {renderChartPreview(template)}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}>
                    <Link 
                      to={`/app/charts/create-from-template/${template._id}`} 
                      style={{
                        backgroundColor: theme === 'dark' ? '#2563eb' : '#3b82f6',
                        color: 'white',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'background-color 0.2s ease',
                      }}
                      className="hover:bg-blue-700"
                    >
                      Use Template
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{
            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
          }}>No chart templates saved yet. Save your chart configurations as templates to reuse them later.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 