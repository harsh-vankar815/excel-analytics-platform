import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getChartById, applyChartTemplate } from '../redux/chart/chartSlice';
import { getRecentFiles } from '../redux/file/fileSlice';
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

const ChartTemplateApply = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const [title, setTitle] = useState('');
  const [selectedFileId, setSelectedFileId] = useState('');

  const { currentChart: template, isLoading: templateLoading, isError: templateError } = useSelector((state) => state.chart);
  const { recentFiles, isLoading: filesLoading } = useSelector((state) => state.file);

  useEffect(() => {
    if (templateId) {
      dispatch(getChartById(templateId));
      dispatch(getRecentFiles());
    }
  }, [dispatch, templateId]);

  useEffect(() => {
    if (template && !title) {
      setTitle(`${template.title} (from template)`);
    }
  }, [template, title]);

  useEffect(() => {
    if (templateError) {
      toast.error('Error loading template. The template may not exist or you may not have permission to use it.');
      navigate('/app/dashboard');
    }
  }, [templateError, navigate]);

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
            const color = colors[0];
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
            const color = colors[0];
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
      
      // Default empty data with theme-specific colors
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
    if (!chart) return null;
    
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

  const handleApplyTemplate = async (e) => {
    e.preventDefault();

    if (!selectedFileId) {
      toast.error('Please select an Excel file');
      return;
    }

    if (!title) {
      toast.error('Please provide a title for the new chart');
      return;
    }

    try {
      const result = await dispatch(applyChartTemplate({
        templateId,
        excelFileId: selectedFileId,
        title
      })).unwrap();

      toast.success('Chart template applied successfully!');
      navigate(`/app/charts/${result._id}`);
    } catch (error) {
      toast.error(error || 'Failed to apply template');
    }
  };

  if (templateLoading || filesLoading) {
    return <Spinner />;
  }

  if (!template || !template.isSavedTemplate) {
    return (
      <div style={{
        backgroundColor: styles.cardBackground,
        color: styles.textColor,
        boxShadow: `0 1px 3px ${styles.shadowColor}`
      }} className="p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Template Not Found</h2>
        <p style={{ color: styles.secondaryColor }}>The template you're looking for doesn't exist or you don't have permission to use it.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <h1 style={{ color: styles.textColor }} className="text-2xl sm:text-3xl font-bold">Apply Chart Template</h1>
      </div>

      <div style={{
        backgroundColor: styles.cardBackground,
        color: styles.textColor,
        borderColor: styles.borderColor,
        boxShadow: `0 1px 3px ${styles.shadowColor}`
      }} className="p-6 rounded-lg shadow-md border">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Template Info - 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 style={{ color: styles.textColor }} className="text-xl font-semibold mb-4">Template Information</h2>
              <div style={{
                backgroundColor: theme === 'dark' ? styles.inputBackground : styles.tableHeaderBackground,
                color: styles.textColor
              }} className="p-4 rounded-lg space-y-3">
                <div>
                  <p style={{ color: styles.secondaryColor }} className="text-sm">Template Name</p>
                  <p style={{ color: styles.textColor }} className="text-base font-medium">{template.templateName || template.title}</p>
                </div>
                <div>
                  <p style={{ color: styles.secondaryColor }} className="text-sm">Chart Type</p>
                  <p style={{ color: styles.textColor }} className="text-base font-medium">{template.type}</p>
                </div>
                <div>
                  <p style={{ color: styles.secondaryColor }} className="text-sm">X-Axis Field</p>
                  <p style={{ color: styles.textColor }} className="text-base font-medium">{template.xAxis?.field || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: styles.secondaryColor }} className="text-sm">Y-Axis Field</p>
                  <p style={{ color: styles.textColor }} className="text-base font-medium">{template.yAxis?.field || 'N/A'}</p>
                </div>
                {template.zAxis && (
                  <div>
                    <p style={{ color: styles.secondaryColor }} className="text-sm">Z-Axis Field (3D)</p>
                    <p style={{ color: styles.textColor }} className="text-base font-medium">{template.zAxis?.field || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              backgroundColor: theme === 'dark' ? styles.inputBackground : styles.tableHeaderBackground
            }} className="h-60 rounded-lg flex items-center justify-center overflow-hidden">
              {renderChartPreview(template)}
            </div>
          </div>

          {/* Apply Form - 3 Columns */}
          <div className="lg:col-span-3">
            <h2 style={{ color: styles.textColor }} className="text-xl font-semibold mb-4">Apply to New Chart</h2>
            <form onSubmit={handleApplyTemplate} className="space-y-6">
              <div>
                <label htmlFor="chartTitle" style={{ color: styles.secondaryColor }} className="block text-sm font-medium mb-1">
                  Chart Title
                </label>
                <input
                  type="text"
                  id="chartTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    backgroundColor: styles.inputBackground,
                    color: styles.textColor,
                    borderColor: styles.borderColor
                  }}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter chart title"
                  required
                />
              </div>

              <div>
                <label htmlFor="fileSelect" style={{ color: styles.secondaryColor }} className="block text-sm font-medium mb-1">
                  Select Excel File
                </label>
                <select
                  id="fileSelect"
                  value={selectedFileId}
                  onChange={(e) => setSelectedFileId(e.target.value)}
                  style={{
                    backgroundColor: styles.inputBackground,
                    color: styles.textColor,
                    borderColor: styles.borderColor
                  }}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select an Excel file</option>
                  {recentFiles.map((file) => (
                    <option key={file._id} value={file._id}>
                      {file.originalName}
                    </option>
                  ))}
                </select>
                <p style={{ color: styles.secondaryColor }} className="mt-1 text-sm">
                  The template will be applied to the selected Excel file. Make sure the file has similar data structure.
                </p>
              </div>

              <div style={{
                backgroundColor: theme === 'dark' ? 'rgba(217, 119, 6, 0.2)' : 'rgba(254, 243, 199, 1)',
                borderColor: theme === 'dark' ? 'rgba(217, 119, 6, 0.4)' : 'rgba(252, 211, 77, 1)',
                color: theme === 'dark' ? '#fbbf24' : '#92400e'
              }} className="border p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 style={{ 
                      color: theme === 'dark' ? '#fbbf24' : '#92400e' 
                    }} className="text-sm font-medium">Important note</h3>
                    <div className="mt-2 text-sm" style={{ 
                      color: theme === 'dark' ? '#fcd34d' : '#b45309' 
                    }}>
                      <p>
                        The selected file should have similar data structure as the one used to create this template.
                        This includes having the same column names that are used in the chart configuration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/app/dashboard')}
                  style={{
                    backgroundColor: styles.buttonSecondaryBackground,
                    color: styles.buttonSecondaryText,
                    borderColor: styles.borderColor
                  }}
                  className="px-4 py-2 text-sm font-medium border rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: styles.buttonPrimaryBackground,
                    color: styles.buttonPrimaryText
                  }}
                  className="px-4 py-2 text-sm font-medium border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  Apply Template
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartTemplateApply; 