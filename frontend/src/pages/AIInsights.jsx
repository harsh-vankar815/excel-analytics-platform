import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getFiles } from '../redux/file/fileSlice';
import { getCharts } from '../redux/chart/chartSlice';
import { SparklesIcon, LightBulbIcon, DocumentTextIcon, ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline';
import Spinner from '../components/ui/Spinner';
import { useTheme } from '../contexts/ThemeContext';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea, Scatter, Bubble } from 'react-chartjs-2';
import ChartPreview3D from '../components/charts/ChartPreview3D';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
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

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
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

const AIInsights = () => {
  const dispatch = useDispatch();
  const { files, isLoading: filesLoading } = useSelector(state => state.file);
  const { charts, isLoading: chartsLoading } = useSelector(state => state.chart);
  const [recentFiles, setRecentFiles] = useState([]);
  const [recentCharts, setRecentCharts] = useState([]);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  useEffect(() => {
    dispatch(getFiles());
    dispatch(getCharts());
  }, [dispatch]);

  useEffect(() => {
    if (files.length > 0) {
      // Get 5 most recent files
      const recent = [...files]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentFiles(recent);
    }
  }, [files]);

  useEffect(() => {
    if (charts.length > 0) {
      // Get 5 most recent charts
      const recent = [...charts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentCharts(recent);
    }
  }, [charts]);

  const isLoading = filesLoading || chartsLoading;

  // Function to generate simplified chart data for preview
  const generatePreviewChartData = (chartType) => {
    // Default chart colors based on theme
    const colors = theme === 'dark' 
      ? ['#60a5fa', '#a78bfa', '#34d399', '#f87171', '#fbbf24']
      : ['#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f59e0b'];
      
    // Simple data for charts preview
    switch (chartType) {
      case 'bar':
      case 'line':
      case 'horizontalBar':
      case 'stackedBar':
      case 'area':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Preview Data',
            data: [12, 19, 8, 15, 10],
            backgroundColor: colors[0] + '80',
            borderColor: colors[0],
            borderWidth: 1
          }]
        };
      case 'mixed':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [
            {
              label: 'Dataset 1',
              data: [12, 19, 8, 15, 10],
              backgroundColor: colors[0] + '80',
              borderColor: colors[0],
              borderWidth: 1
            },
            {
              label: 'Dataset 2',
              data: [8, 15, 12, 5, 18],
              backgroundColor: colors[1] + '80',
              borderColor: colors[1],
              borderWidth: 1
            }
          ]
        };
      case 'pie':
      case 'doughnut':
      case 'polarArea':
        return {
          labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
          datasets: [{
            data: [12, 19, 8, 15, 10],
            backgroundColor: colors.map(color => color + '80'),
            borderColor: colors,
            borderWidth: 1
          }]
        };
      case 'radar':
        return {
          labels: ['Speed', 'Power', 'Range', 'Durability', 'Accuracy'],
          datasets: [{
            label: 'Dataset',
            data: [12, 19, 8, 15, 10],
            backgroundColor: colors[0] + '40',
            borderColor: colors[0],
            borderWidth: 1
          }]
        };
      case 'bubble':
        return {
          datasets: [{
            label: 'Dataset',
            data: [
              { x: 1, y: 10, r: 5 },
              { x: 2, y: 15, r: 8 },
              { x: 3, y: 8, r: 4 },
              { x: 4, y: 12, r: 6 },
              { x: 5, y: 18, r: 9 }
            ],
            backgroundColor: colors.map(color => color + '80')
          }]
        };
      case 'scatter':
        return {
          datasets: [{
            label: 'Dataset',
            data: [
              { x: 1, y: 10 },
              { x: 2, y: 15 },
              { x: 3, y: 8 },
              { x: 4, y: 12 },
              { x: 5, y: 18 }
            ],
            backgroundColor: colors[0],
            borderColor: colors[0]
          }]
        };
      default:
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Preview Data',
            data: [12, 19, 8, 15, 10],
            backgroundColor: colors[0] + '80',
            borderColor: colors[0],
            borderWidth: 1
          }]
        };
    }
  };



  // Render chart preview based on chart type
  const renderChartPreview = (chart) => {
    if (!chart || !chart.type) return null;
    
    // Handle 3D chart types
    if (chart.type.includes('3d')) {
      // Extract the base chart type by removing the '3d-' prefix
      const baseChartType = chart.type.replace('3d-', '');
      
      // Only render 3D previews for specific chart types
      const supported3DTypes = ['column', 'bar', 'scatter', 'line', 'bubble', 'surface', 'heatmap', 'waterfall'];
      
      if (supported3DTypes.includes(baseChartType)) {
        try {
          // Create sample data for 3D preview that works with ChartPreview3D component
          const sampleData = [];
          
          // Create a more structured sample data format for 3D charts
          // Generate different data patterns based on chart type
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
          
          return (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <ChartPreview3D 
                data={sampleData}
                selectedColumns={{
                  x: 'category',
                  y: ['value']
                }}
                chartType={baseChartType}
              />
            </div>
          );
        } catch (error) {
          console.error('Error rendering 3D chart preview:', error);
          // Fallback to icon if there's an error
          return (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: styles.secondaryColor
            }}>
              <CubeIcon style={{ 
                height: '2.5rem', 
                width: '2.5rem', 
                color: theme === 'light' ? '#8b5cf6' : '#a78bfa',
                marginBottom: '0.5rem'
              }} />
              <span style={{ fontSize: '0.875rem' }}>
                3D Chart Preview
              </span>
            </div>
          );
        }
      } else {
        // For unsupported 3D chart types
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: styles.secondaryColor
          }}>
            <CubeIcon style={{ 
              height: '2.5rem', 
              width: '2.5rem', 
              color: theme === 'light' ? '#8b5cf6' : '#a78bfa',
              marginBottom: '0.5rem'
            }} />
            <span style={{ fontSize: '0.875rem' }}>
              3D Preview Not Available
            </span>
          </div>
        );
      }
    }
    
    const chartData = generatePreviewChartData(chart.type);
    
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
      case 'scatter':
        return <Scatter data={chartData} />;
      case 'bubble':
        return <Bubble data={chartData} />;
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
        return <Bar data={chartData} />;
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 1rem',
      color: theme === 'dark' ? styles.textColor : '#1f2937'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: theme === 'dark' ? styles.textColor : '#1f2937',
          marginBottom: '0.5rem'
        }}>AI Insights</h1>
        <p style={{
          color: theme === 'dark' ? styles.textColorSecondary : '#6b7280'
        }}>
          Leverage AI to gain valuable insights from your Excel data and visualizations
        </p>
      </div>

      {/* AI Features Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        {/* File Summary Feature */}
        <div style={{
          backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: theme === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(219, 234, 254, 1)'
              }}>
                <DocumentTextIcon style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: theme === 'dark' ? '#60a5fa' : '#2563eb'
                }} />
              </div>
              <h2 style={{
                marginLeft: '0.75rem',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: theme === 'dark' ? styles.textColor : '#1f2937'
              }}>
                Excel File Summaries
              </h2>
            </div>
            <p style={{
              color: theme === 'dark' ? styles.textColorSecondary : '#6b7280',
              marginBottom: '1.5rem'
            }}>
              Generate comprehensive summaries of your Excel files with AI. Get insights about data structure, patterns, and recommendations for analysis.
            </p>
            <Link
              to="/app/files"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                color: '#ffffff',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              View Your Files
            </Link>
          </div>
        </div>

        {/* Chart Insights Feature */}
        <div style={{
          backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(237, 233, 254, 1)'
              }}>
                <ChartBarIcon style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: theme === 'dark' ? '#a78bfa' : '#7c3aed'
                }} />
              </div>
              <h2 style={{
                marginLeft: '0.75rem',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: theme === 'dark' ? styles.textColor : '#1f2937'
              }}>
                Chart Insights
              </h2>
            </div>
            <p style={{
              color: theme === 'dark' ? styles.textColorSecondary : '#6b7280',
              marginBottom: '1.5rem'
            }}>
              Get AI-powered insights for your charts. Understand trends, patterns, and correlations in your visualized data.
            </p>
            <Link
              to="/app/charts"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
                color: '#ffffff',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              View Your Charts
            </Link>
          </div>
        </div>

        {/* Advanced Analysis Feature */}
        <div style={{
          backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(209, 250, 229, 1)'
              }}>
                <LightBulbIcon style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: theme === 'dark' ? '#34d399' : '#10b981'
                }} />
              </div>
              <h2 style={{
                marginLeft: '0.75rem',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: theme === 'dark' ? styles.textColor : '#1f2937'
              }}>
                Advanced Analysis
              </h2>
            </div>
            <p style={{
              color: theme === 'dark' ? styles.textColorSecondary : '#6b7280',
              marginBottom: '1.5rem'
            }}>
              Unlock deeper insights with advanced AI analysis. Get detailed recommendations and discover hidden patterns in your data.
            </p>
            <Link
              to="/app/charts"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: theme === 'dark' ? '#10b981' : '#059669',
                color: '#ffffff',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
            >
              Analyze Your Data
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Files with AI Insights */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: theme === 'dark' ? styles.textColor : '#1f2937',
          marginBottom: '1rem'
        }}>
          Recent Files for Analysis
        </h2>
        {recentFiles.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {recentFiles.map(file => (
              <div 
                key={file._id} 
                style={{
                  backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
                  borderRadius: '0.5rem',
                  boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '1rem' }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: theme === 'dark' ? styles.textColor : '#1f2937',
                    marginBottom: '0.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {file.originalName}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: theme === 'dark' ? styles.textColorSecondary : '#6b7280',
                    marginBottom: '0.75rem'
                  }}>
                    {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: theme === 'dark' ? styles.textColorSecondary : '#6b7280'
                    }}>
                      {file.sheets?.length || 0} sheets
                    </span>
                    <Link
                      to={`/app/files/${file._id}`}
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: theme === 'dark' ? '#60a5fa' : '#2563eb',
                        textDecoration: 'none'
                      }}
                    >
                      Generate Insights →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
            borderRadius: '0.5rem',
            boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: theme === 'dark' ? styles.textColorSecondary : '#6b7280'
            }}>
              You don't have any Excel files yet. Upload files to get AI insights.
            </p>
            <Link
              to="/app/upload"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
                color: '#ffffff',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Upload Files
            </Link>
          </div>
        )}
      </div>

      {/* Recent Charts with AI Insights */}
      <div>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: theme === 'dark' ? styles.textColor : '#1f2937',
          marginBottom: '1rem'
        }}>
          Recent Charts for Analysis
        </h2>
        {recentCharts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {recentCharts.map(chart => (
              <div 
                key={chart._id} 
                style={{
                  backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
                  borderRadius: '0.5rem',
                  boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '1rem' }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '500',
                    color: theme === 'dark' ? styles.textColor : '#1f2937',
                    marginBottom: '0.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {chart.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: theme === 'dark' ? styles.textColorSecondary : '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    Type: {chart.type}
                  </p>
                  <div style={{
                    height: '10rem',
                    backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(243, 244, 246, 0.7)',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    padding: '0.5rem'
                  }}>
                    {renderChartPreview(chart)}
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '0.875rem',
                      color: theme === 'dark' ? styles.textColorSecondary : '#6b7280'
                    }}>
                      {new Date(chart.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/app/charts/${chart._id}`}
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        color: theme === 'dark' ? '#a78bfa' : '#7c3aed',
                        textDecoration: 'none'
                      }}
                    >
                      View Insights →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
            borderRadius: '0.5rem',
            boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.5)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              color: theme === 'dark' ? styles.textColorSecondary : '#6b7280'
            }}>
              You don't have any charts yet. Create charts to get AI insights.
            </p>
            <Link
              to="/app/files"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: theme === 'dark' ? '#8b5cf6' : '#7c3aed',
                color: '#ffffff',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Create Charts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights; 