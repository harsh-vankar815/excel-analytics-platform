import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  BubbleController,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, PolarArea, Radar, Scatter, Bubble } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { 
  CameraIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  BubbleController,
  Title,
  Tooltip,
  Legend
);

// Helper function to analyze column data type
const analyzeColumnDataType = (column, data) => {
  if (!data || data.length === 0) return 'unknown';

  // Get non-null values for the column
  const values = data
    .map(row => row[column])
    .filter(value => value !== null && value !== undefined);

  if (values.length === 0) return 'unknown';

  // Check if all values are numbers or can be converted to numbers
  const isAllNumeric = values.every(value => {
    if (typeof value === 'number') return true;
    if (typeof value === 'string') {
      return !isNaN(value) && !isNaN(parseFloat(value));
    }
    return false;
  });

  if (isAllNumeric) return 'numeric';

  // Default to string type
  return 'string';
};

const Interactive2DChart = ({ 
  data, 
  columns,
  selectedColumns,
  chartType = 'bar',
  chartTitle = '',
  onDownload
}) => {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          font: {
            size: 12
          },
          color: isDarkMode => isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)'
        }
      },
      title: {
        display: true,
        text: chartTitle,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: isDarkMode => isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        enabled: true,
        mode: 'index',
        intersect: false,
        backgroundColor: isDarkMode => isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: isDarkMode => isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)',
        bodyColor: isDarkMode => isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 4
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode => isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)'
        },
        ticks: {
          color: isDarkMode => isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'
        }
      },
      y: {
        grid: {
          color: isDarkMode => isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)'
        },
        ticks: {
          color: isDarkMode => isDarkMode ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    }
  });
  const chartRef = useRef(null);
  const chartContainerRef = useRef(null);
  const [colorScheme, setColorScheme] = useState('default');
  
  const colorSchemes = useMemo(() => ({
    default: [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F97316', // Orange
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
    ],
    pastel: [
      '#FFB5A7', // Pastel Red
      '#FCD5CE', // Pastel Orange
      '#F8EDEB', // Pastel Pink
      '#F9DCC4', // Pastel Yellow
      '#FFE8D6', // Pastel Beige
      '#D8E2DC', // Pastel Green
    ],
    vibrant: [
      '#FF3366', // Vibrant Red
      '#FF9933', // Vibrant Orange
      '#FFFF66', // Vibrant Yellow
      '#33CC99', // Vibrant Green
      '#3366FF', // Vibrant Blue
      '#CC33FF', // Vibrant Purple
    ],
    monochrome: [
      '#000000', // Black
      '#333333',
      '#666666',
      '#999999',
      '#CCCCCC',
      '#EEEEEE', // Light gray
    ]
  }), []);

  // Process chart data
  useEffect(() => {
    if (!data || !selectedColumns.x || !selectedColumns.y || selectedColumns.y.length === 0) {
      return;
    }

    try {
      // Analyze data types for proper scale configuration
      const xColType = analyzeColumnDataType(selectedColumns.x, data);
      const yColTypes = selectedColumns.y.map(col => analyzeColumnDataType(col, data));
      const hasStringXAxis = xColType === 'string';
      const hasStringYAxis = yColTypes.some(type => type === 'string');

      const labels = data.map(row => row[selectedColumns.x]);
      
      const datasets = selectedColumns.y.map((column, index) => {
        // Generate colors based on scheme and index
        const colors = colorSchemes[colorScheme] || colorSchemes.default;
        const color = colors[index % colors.length];
        
        // Basic dataset common to all chart types
        const commonDataset = {
          label: column,
          borderColor: color,
          backgroundColor: `${color}80`, // 50% opacity
        };

        // Add chart-specific configurations
        switch (chartType) {
          case 'line':
            return {
              ...commonDataset,
              data: data.map(row => {
                // Handle string values in y-axis for line charts
                if (hasStringYAxis) {
                  // For string values, use index as y value and store original as label
                  return row[column] ? parseFloat(row[column]) || index : index;
                }
                return parseFloat(row[column]) || 0;
              }),
              borderWidth: 2,
              pointBackgroundColor: color,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.3,
              fill: index === 0,
            };
            
          case 'bar':
          case 'horizontalBar': // Handle horizontal bar charts the same way as regular bar charts
            return {
              ...commonDataset,
              data: data.map(row => {
                // Handle string values in y-axis for bar charts
                if (hasStringYAxis) {
                  // For string values, use index as y value and store original as label
                  return row[column] ? parseFloat(row[column]) || index : index;
                }
                return parseFloat(row[column]) || 0;
              }),
              borderWidth: 1,
              hoverBackgroundColor: color,
            };
            
          case 'pie':
          case 'doughnut':
          case 'polarArea':
            // For these chart types, we need a different format
            // They show one dataset with multiple colors
            if (index === 0) {
              return {
                ...commonDataset,
                data: data.map(row => parseFloat(row[column]) || 0),
                backgroundColor: colorSchemes[colorScheme] || colorSchemes.default,
                borderWidth: 1,
                borderColor: '#fff',
              };
            }
            return null;
            
          case 'radar':
            return {
              ...commonDataset,
              data: data.map(row => parseFloat(row[column]) || 0),
              borderWidth: 2,
              pointBackgroundColor: color,
              pointRadius: 3,
              pointHoverRadius: 5,
              fill: true,
            };
            
          case 'scatter':
            return {
              ...commonDataset,
              data: data.map(row => ({
                x: hasStringXAxis ? data.indexOf(row) : (parseFloat(row[selectedColumns.x]) || 0),
                y: hasStringYAxis ? data.indexOf(row) : (parseFloat(row[column]) || 0)
              })),
              pointBackgroundColor: color,
              pointRadius: 6,
              pointHoverRadius: 8,
            };
            
          default:
            return {
              ...commonDataset,
              data: data.map(row => parseFloat(row[column]) || 0),
            };
        }
      }).filter(Boolean); // Remove null entries (from pie/doughnut)

      // For pie/doughnut/polarArea, only use first dataset
      const finalDatasets = ['pie', 'doughnut', 'polarArea'].includes(chartType)
        ? [datasets[0]]
        : datasets;

      setChartData({
        labels,
        datasets: finalDatasets,
      });

      // Update chart options based on chart type - use functional update to avoid dependency on chartOptions
      setChartOptions(prevOptions => {
        let updatedOptions = { ...prevOptions };
        
        if (['pie', 'doughnut', 'polarArea'].includes(chartType)) {
          updatedOptions = {
            ...updatedOptions,
            cutout: chartType === 'doughnut' ? '70%' : 0,
            plugins: {
              ...updatedOptions.plugins,
              legend: {
                ...updatedOptions.plugins.legend,
                position: 'right',
                align: 'center',
              },
            },
          };
        } else if (chartType === 'radar') {
          updatedOptions = {
            ...updatedOptions,
            scales: {
              r: {
                grid: {
                  color: 'rgba(120, 120, 120, 0.2)',
                },
                angleLines: {
                  color: 'rgba(120, 120, 120, 0.2)',
                },
                pointLabels: {
                  font: {
                    size: 12,
                  },
                },
              },
            },
          };
        } else if (chartType === 'scatter') {
          updatedOptions = {
            ...updatedOptions,
            scales: {
              x: {
                type: hasStringXAxis ? 'category' : 'linear',
                position: 'bottom',
                title: {
                  display: true,
                  text: selectedColumns.x,
                  color: '#64748b',
                  font: {
                    size: 13,
                    weight: 'bold',
                  },
                  padding: { top: 10 }
                },
                grid: {
                  color: 'rgba(120, 120, 120, 0.2)',
                },
              },
              y: {
                type: hasStringYAxis ? 'category' : 'linear',
                title: {
                  display: true,
                  text: selectedColumns.y.join(', '),
                  color: '#64748b',
                  font: {
                    size: 13,
                    weight: 'bold',
                  },
                  padding: { bottom: 10 }
                },
                grid: {
                  color: 'rgba(120, 120, 120, 0.2)',
                },
              },
            },
          };
        } else {
          // Bar and line charts
          updatedOptions = {
            ...updatedOptions,
            scales: {
              x: {
                type: chartType === 'horizontalBar' 
                  ? 'linear' // For horizontal bars, x-axis is numeric values
                  : (hasStringXAxis ? 'category' : 'linear'),
                grid: {
                  display: false,
                },
                title: {
                  display: true,
                  text: chartType === 'horizontalBar' ? selectedColumns.y.join(', ') : selectedColumns.x,
                  color: '#64748b',
                  font: {
                    size: 13,
                    weight: 'bold',
                  },
                  padding: { top: 10 }
                },
                beginAtZero: chartType === 'horizontalBar', // Start from zero for horizontal bars
              },
              y: {
                type: chartType === 'horizontalBar'
                  ? 'category' // For horizontal bars, y-axis is categories
                  : (hasStringYAxis ? 'category' : 'linear'),
                grid: {
                  color: 'rgba(120, 120, 120, 0.2)',
                },
                title: {
                  display: true,
                  text: chartType === 'horizontalBar' ? selectedColumns.x : selectedColumns.y.join(', '),
                  color: '#64748b',
                  font: {
                    size: 13,
                    weight: 'bold',
                  },
                  padding: { bottom: 10 }
                },
                beginAtZero: !hasStringYAxis && chartType !== 'horizontalBar',
              },
            },
          };
          
          // Add indexAxis for horizontal bar charts
          if (chartType === 'horizontalBar') {
            updatedOptions.indexAxis = 'y';
          }
        }

        // Update title
        updatedOptions.plugins.title.text = chartTitle;
        
        return updatedOptions;
      });
      
    } catch (error) {
      console.error("Error processing chart data:", error);
    }
  }, [data, selectedColumns, chartType, chartTitle, colorScheme, colorSchemes]); // Removed chartOptions from dependencies

  const downloadChartAsImage = () => {
    if (!chartRef.current || !chartContainerRef.current) {
      console.error("Chart reference not available");
      return;
    }
    
    try {
      // Get the chart instance from the ref
      const chartInstance = chartRef.current;
      
      // For Chart.js v3+, we can use toBase64Image directly
      if (chartInstance && typeof chartInstance.toBase64Image === 'function') {
        const dataURL = chartInstance.toBase64Image('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `${chartTitle || 'chart'}.png`;
        link.href = dataURL;
        link.click();
      } else {
        // Fallback to html2canvas if direct method is not available
        html2canvas(chartContainerRef.current, {
          backgroundColor: null,
          scale: 2, // Higher scale for better quality
          useCORS: true, // Enable CORS for external images
          allowTaint: true, // Allow tainted canvas if needed
          logging: false // Disable logging
        }).then(canvas => {
          // Convert canvas to blob and download
          const link = document.createElement('a');
          link.download = `${chartTitle || 'chart'}.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
        }).catch(err => {
          console.error("Error capturing chart with html2canvas:", err);
        });
      }
    } catch (error) {
      console.error("Error downloading chart image:", error);
    }
  };

  // Memoize chart rendering to prevent unnecessary re-renders
  const renderChart = useMemo(() => {
    if (!chartData) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Select axes to display chart</p>
        </div>
      );
    }

    const props = {
      data: chartData,
      options: chartOptions,
      height: 300, // Set a minimum height for the chart
    };

    try {
      switch (chartType) {
        case 'bar':
          return <Bar {...props} ref={chartRef} />;
        case 'horizontalBar':
          // Create a new options object with indexAxis set to 'y'
          const horizontalOptions = {
            ...chartOptions,
            indexAxis: 'y', // This is the key property for horizontal bar charts
            scales: {
              ...chartOptions.scales,
              x: {
                ...chartOptions.scales.x,
                type: 'linear', // For horizontal bars, x-axis is typically linear
                beginAtZero: true,
              },
              y: {
                ...chartOptions.scales.y,
                type: 'category', // For horizontal bars, y-axis is typically category
              }
            }
          };
          return <Bar data={chartData} options={horizontalOptions} ref={chartRef} height={300} />;
        case 'line':
          return <Line {...props} ref={chartRef} />;
        case 'area':
          const areaProps = {
            ...props,
            data: {
              ...chartData,
              datasets: chartData.datasets.map(dataset => ({
                ...dataset,
                fill: true
              }))
            }
          };
          return <Line {...areaProps} ref={chartRef} />;
        case 'pie':
          return <Pie {...props} ref={chartRef} />;
        case 'doughnut':
          return <Doughnut {...props} ref={chartRef} />;
        case 'polarArea':
          return <PolarArea {...props} ref={chartRef} />;
        case 'radar':
          return <Radar {...props} ref={chartRef} />;
        case 'scatter':
          return <Scatter {...props} ref={chartRef} />;
        case 'bubble':
          const bubbleProps = {
            ...props,
            data: {
              ...chartData,
              datasets: chartData.datasets.map(dataset => {
                // Generate random radius values between 5 and 15 for each data point
                const radiusValues = dataset.data.map(() => Math.floor(Math.random() * 10) + 5);
                
                return {
                  ...dataset,
                  data: dataset.data.map((y, i) => ({
                    x: parseFloat(chartData.labels[i]) || i,
                    y: y,
                    r: radiusValues[i]
                  }))
                };
              })
            }
          };
          return <Bubble {...bubbleProps} ref={chartRef} />;
        case 'stackedBar':
          const stackedProps = {
            ...props,
            options: {
              ...chartOptions,
              scales: {
                ...chartOptions.scales,
                x: {
                  ...chartOptions.scales?.x,
                  stacked: true
                },
                y: {
                  ...chartOptions.scales?.y,
                  stacked: true
                }
              }
            }
          };
          return <Bar {...stackedProps} ref={chartRef} />;
        case 'mixed':
          const mixedProps = {
            ...props,
            data: {
              ...chartData,
              datasets: chartData.datasets.map((dataset, index) => ({
                ...dataset,
                type: index === 0 ? 'bar' : 'line'
              }))
            }
          };
          return <Bar {...mixedProps} ref={chartRef} />;
        default:
          return <Bar {...props} ref={chartRef} />;
      }
    } catch (error) {
      console.error("Error rendering chart:", error);
      return (
        <div className="flex h-full w-full items-center justify-center">
          <p className="text-red-500 dark:text-red-400">Error rendering chart: {error.message}</p>
        </div>
      );
    }
  }, [chartData, chartOptions, chartType]);

  return (
    <div className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white">
          {chartTitle || 'Chart Preview'}
        </h3>
        <div className="flex space-x-2">
          {/* Download as Image */}
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            onClick={downloadChartAsImage}
            title="Download as image"
          >
            <CameraIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <div className="p-4 flex-grow" style={{ minHeight: '300px', height: 'calc(100% - 60px)' }} ref={chartContainerRef}>
        {renderChart}
      </div>
    </div>
  );
};

export default Interactive2DChart; 