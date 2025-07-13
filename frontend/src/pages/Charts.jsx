import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCharts, reset } from '../redux/chart/chartSlice';
import Spinner from '../components/ui/Spinner';
import { Bar, Line, Pie, Doughnut, Scatter, PolarArea, Radar, Bubble } from 'react-chartjs-2';
import ChartPreview3D from '../components/charts/ChartPreview3D';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PolarAreaController,
  RadarController,
  ScatterController,
  BarController,
  BubbleController
} from 'chart.js';
import { useTheme } from '../contexts/ThemeContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PolarAreaController,
  RadarController,
  ScatterController,
  BarController,
  BubbleController
);

const Charts = () => {
  const dispatch = useDispatch();
  const { charts, isLoading } = useSelector((state) => state.chart);
  const [searchTerm, setSearchTerm] = useState('');
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  // Fetch charts when component mounts or when user navigates to this page
  useEffect(() => {
    // Reset any previous chart state
    dispatch(reset());
    // Fetch all charts
    dispatch(getCharts());
    
    // No need for interval refresh - it's causing infinite updates
    // The charts will refresh when the component mounts
  }, [dispatch]);
  
  const filteredCharts = charts.filter(chart => 
    chart.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      console.warn('Could not extract chart data for preview, using default structure');
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
      case 'polarArea':
        return <PolarArea data={chartData} />;
      case 'radar':
        return <Radar data={chartData} />;
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

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 style={{ color: theme === 'dark' ? '#ffffff' : '#1f2937' }} className="text-2xl sm:text-3xl font-bold">My Charts</h1>
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search charts..."
            style={{
              backgroundColor: theme === 'dark' ? styles.inputBackground : '#ffffff',
              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
              color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCharts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharts.map((chart) => (
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
                  position: 'relative'
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
                  }}>
                    Created: {new Date(chart.createdAt).toLocaleDateString()}
                  </span>
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
        <div 
          style={{
            backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
            borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb'
          }}
          className="p-8 rounded-lg shadow-md border text-center"
        >
          <svg 
            style={{ color: theme === 'dark' ? '#4b5563' : '#9ca3af' }} 
            className="w-16 h-16 mx-auto mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 
            style={{ color: theme === 'dark' ? '#f3f4f6' : '#1f2937' }} 
            className="text-xl font-medium mb-2"
          >
            No Charts Found
          </h3>
          <p 
            style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} 
            className="mb-6"
          >
            {searchTerm 
              ? `No charts matching "${searchTerm}"` 
              : "You haven't created any charts yet. Create a chart from your data files."}
          </p>
          <Link
            to="/app/files"
            style={{
              backgroundColor: theme === 'dark' ? styles.buttonPrimaryBackground : styles.buttonPrimaryBackground,
              color: styles.buttonPrimaryText
            }}
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View Data Files
          </Link>
        </div>
      )}
    </div>
  );
};

export default Charts; 