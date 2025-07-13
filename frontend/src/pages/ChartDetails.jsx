import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
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
  BubbleController,
  ScatterController,
  PolarAreaController
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, PolarArea, Radar, Bubble, Scatter } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getChartById, updateChart, deleteChart, saveChartAsTemplate, reset } from '../redux/chart/chartSlice';
import { isValidObjectId } from '../utils/validators';
import Interactive3DChart from '../components/charts/Interactive3DChart';
import Spinner from '../components/ui/Spinner';
import AIInsights from '../components/AIInsights';
import AIAdvancedInsights from '../components/AIAdvancedInsights';
import { useTheme } from '../contexts/ThemeContext';
import Skeleton, { TextSkeleton, CardSkeleton } from '../components/ui/Skeleton';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  PieController,
  ArcElement,
  RadialLinearScale,
  BubbleController,
  ScatterController,
  PolarAreaController,
  Title,
  Tooltip,
  Legend
);

const ChartDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const chartRef = useRef(null);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  const { currentChart, isLoading, isError, message } = useSelector((state) => state.chart);
  const [isEditing, setIsEditing] = useState(false);
  const [chartTitle, setChartTitle] = useState('');
  const [chartType, setChartType] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [showAdvancedInsights, setShowAdvancedInsights] = useState(false);
  
  // Fetch chart data when component loads
  useEffect(() => {
    if (!id) {
      toast.error('Invalid chart ID: ID is missing');
      navigate('/app/charts');
      return;
    }

    // Validate MongoDB ObjectId format (24 hex characters)
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      toast.error('Invalid chart ID format');
      navigate('/app/charts');
      return;
    }

    // Added debug logs
    console.log('Chart ID from URL params:', id);
    console.log('Chart ID type:', typeof id);

    // Reset error state before fetching
    dispatch(reset());
    
    console.log('Fetching chart with ID:', id);
    dispatch(getChartById(id))
      .unwrap()
      .then(response => {
        if (!response) {
          console.error('Empty response from server');
          throw new Error('Empty response from server');
        }
        
        // Handle both response structures
        const chartData = response.data || response;
        
        if (!chartData) {
          console.error('Invalid response structure:', response);
          throw new Error('Invalid response from server: Missing chart data');
        }
        
        // Ensure chart has a data field
        if (!chartData.data) {
          console.warn('Chart missing data field, adding default structure');
          chartData.data = {
            labels: [],
            datasets: [],
            source: []
          };
        }
        
        console.log('Chart data received:', response);
        setDataReady(true);
      })
      .catch(error => {
        console.error('Error fetching chart details:', error);
        
        // More specific error for not found cases
        if (typeof error === 'string') {
          if (error.includes('not found')) {
            toast.error(`Chart not found: The chart with ID "${id}" does not exist or may have been deleted.`);
          } else if (error.includes('not authorized')) {
            toast.error(`You don't have permission to view this chart.`);
          } else if (error.includes('data structure is invalid')) {
            toast.error(`Chart data is invalid. Please try creating the chart again.`);
          } else {
            toast.error(`Failed to load chart: ${error}`);
          }
        } else {
          toast.error(`Failed to load chart: ${error.message || 'Unknown error'}`);
        }
      });
  }, [dispatch, id, navigate]);
  
  // Set form values when chart data is loaded
  useEffect(() => {
    if (currentChart) {
      console.log('Current chart state:', currentChart);
      setChartTitle(currentChart.title || '');
      setChartType(currentChart.type || '');
      
      // Log chart data structure for debugging
      console.log('Chart config:', currentChart.config);
      console.log('xAxis:', currentChart.xAxis);
      console.log('yAxis:', currentChart.yAxis);
    }
  }, [currentChart]);
  
  const handleSaveChanges = async () => {
    if (!chartTitle.trim()) {
      toast.error('Chart title cannot be empty');
      return;
    }
    
    try {
      // Get the current configuration, falling back to an empty object if none exists
      const chartConfiguration = currentChart.configuration || {};
      
      await dispatch(
        updateChart({
          id: currentChart._id,
          chartData: {
            title: chartTitle,
            type: chartType,
            configuration: {
              ...chartConfiguration,
              // Include any chart-specific configuration
              chartType: chartType,
              title: chartTitle,
              // Preserve axis configuration
              xAxis: currentChart.xAxis || {},
              yAxis: currentChart.yAxis || {},
              zAxis: currentChart.zAxis || null,
              // Include data configuration
              data: currentChart.data || {},
              // Include any custom configuration
              customConfig: chartConfiguration.customConfig || {}
            }
          },
        })
      ).unwrap();
      
      setIsEditing(false);
      toast.success('Chart updated successfully');
    } catch (err) {
      console.error('Error updating chart:', err);
      toast.error('Failed to update chart: ' + (err.message || 'Unknown error'));
    }
  };
  
  const handleDeleteChart = async () => {
    try {
      await dispatch(deleteChart(currentChart._id)).unwrap();
      toast.success('Chart deleted successfully');
      navigate('/app/charts');
    } catch (err) {
      toast.error('Failed to delete chart');
    } finally {
      setShowDeleteModal(false);
    }
  };
  
  const downloadAsPDF = async () => {
    if (!chartRef.current) return;
    
    try {
      // Wait a small amount of time to ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas with better settings for chart rendering
      const options = {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true, // Allow tainted canvas
        backgroundColor: null, // Transparent background
        logging: false, // Disable logging
        // Prevent oklch color function issue
        onclone: (clonedDoc) => {
          // Remove any styles with "oklch" to prevent parsing errors
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach(el => {
            if (window.getComputedStyle(el).color.includes('oklch')) {
              el.style.color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
            }
            if (window.getComputedStyle(el).backgroundColor.includes('oklch')) {
              el.style.backgroundColor = 'transparent';
            }
          });
          return clonedDoc;
        }
      };
      
      const canvas = await html2canvas(chartRef.current, options);
      const imageData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
      });
      
      // Add chart title
      pdf.setFontSize(16);
      pdf.text(currentChart.title, 15, 15);
      
      // Add chart image
      pdf.addImage(
        imageData,
        'PNG',
        15,
        25,
        pdf.internal.pageSize.getWidth() - 30,
        pdf.internal.pageSize.getHeight() - 40
      );
      
      // Add footer with timestamp
      pdf.setFontSize(8);
      pdf.text(
        `Generated on ${new Date().toLocaleString()}`,
        15,
        pdf.internal.pageSize.getHeight() - 10
      );
      
      pdf.save(`${currentChart.title.replace(/\s+/g, '_')}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to download PDF: ' + (err.message || 'Unknown error'));
    }
  };
  
  const downloadAsImage = async () => {
    if (!chartRef.current) return;
    
    try {
      // Wait a small amount of time to ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use html2canvas with better settings for chart rendering
      const options = {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Allow cross-origin images
        allowTaint: true, // Allow tainted canvas
        backgroundColor: null, // Transparent background
        logging: false, // Disable logging
        // Prevent oklch color function issue
        onclone: (clonedDoc) => {
          // Remove any styles with "oklch" to prevent parsing errors
          const elements = clonedDoc.querySelectorAll('*');
          elements.forEach(el => {
            if (window.getComputedStyle(el).color.includes('oklch')) {
              el.style.color = document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000';
            }
            if (window.getComputedStyle(el).backgroundColor.includes('oklch')) {
              el.style.backgroundColor = 'transparent';
            }
          });
          return clonedDoc;
        }
      };
      
      const canvas = await html2canvas(chartRef.current, options);
      const link = document.createElement('a');
      link.download = `${currentChart.title.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Image downloaded successfully');
    } catch (err) {
      console.error('Error generating image:', err);
      toast.error('Failed to download image: ' + (err.message || 'Unknown error'));
    }
  };
  
  const handleInsightsGenerated = (insights) => {
    // This function will be called when new insights are generated
    console.log('New insights generated:', insights);
    // You could update the chart with the new insights if needed
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
          <TextSkeleton lines={1} width="16rem" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width="5rem" height="2.5rem" className="rounded-md" />
            <Skeleton variant="rectangular" width="5rem" height="2.5rem" className="rounded-md" />
            <Skeleton variant="rectangular" width="5rem" height="2.5rem" className="rounded-md" />
          </div>
        </div>
        
        {/* Main content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart preview skeleton - 2 columns */}
          <div className="lg:col-span-2" style={{
            backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
            borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          }}>
            <CardSkeleton 
              headerHeight="3rem"
              contentLines={0}
              showFooter={false}
            />
            <div className="h-96 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
            </div>
          </div>
          
          {/* Sidebar skeleton - 1 column */}
          <div className="space-y-6">
            {/* Chart info skeleton */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            }} className="p-5 rounded-lg border shadow-sm">
              <TextSkeleton lines={1} width="8rem" />
              <div className="mt-4 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col">
                    <TextSkeleton lines={1} width="6rem" />
                    <Skeleton variant="rectangular" height="2rem" className="mt-1 rounded-md" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actions skeleton */}
            <div style={{
              backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
            }} className="p-5 rounded-lg border shadow-sm">
              <TextSkeleton lines={1} width="8rem" />
              <div className="mt-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height="2.5rem" className="rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* AI Insights section skeleton */}
        <div style={{
          backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        }} className="p-5 rounded-lg border shadow-sm mt-6">
          <TextSkeleton lines={1} width="10rem" />
          <div className="mt-4">
            <TextSkeleton lines={3} />
          </div>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div style={{
        display: 'flex',
        height: '70vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}>
        <div style={{
          maxWidth: '28rem',
          width: '100%',
          backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
          borderRadius: '0.5rem',
          boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <svg style={{
            width: '4rem',
            height: '4rem',
            color: '#ef4444',
            margin: '0 auto 1rem'
          }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: theme === 'dark' ? styles.textColor : '#1f2937',
            marginBottom: '0.5rem'
          }}>Error loading chart</h2>
          <p style={{
            color: theme === 'dark' ? styles.textColorSecondary : '#4b5563',
            marginBottom: '1.5rem'
          }}>
            {message || "Request failed with status code 404. The chart may have been deleted or you don't have permission to view it."}
          </p>
          <button
            onClick={() => navigate('/app/charts')}
            style={{
              width: '100%',
              borderRadius: '0.375rem',
              backgroundColor: styles.primaryColor,
              padding: '0.5rem 1rem',
              color: '#ffffff',
              transition: 'background-color 0.2s ease',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Return to Charts
          </button>
        </div>
      </div>
    );
  }
  
  if (!currentChart) {
    return (
      <div style={{
        display: 'flex',
        height: '70vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: theme === 'dark' ? styles.textColor : '#1f2937'
        }}>Chart not found</h2>
        <button
          onClick={() => navigate('/app/charts')}
          style={{
            marginTop: '1rem',
            borderRadius: '0.375rem',
            backgroundColor: styles.primaryColor,
            padding: '0.5rem 1rem',
            color: '#ffffff',
            transition: 'background-color 0.2s ease',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Return to Charts
        </button>
      </div>
    );
  }

  // Handle different chart data structures from backend
  const prepareChartData = () => {
    if (!currentChart) {
      console.error('No chart data available');
      return null;
    }
    
    try {
      console.log('Chart data to process:', currentChart);
      
      // Ensure chart has data field
      if (!currentChart.data) {
        console.warn('Chart missing data field, creating default structure');
        currentChart.data = {
          labels: [],
          datasets: [],
          source: []
        };
      }
      
      // First look for data in the 'data' property if it exists
      if (currentChart.data && (currentChart.data.labels || currentChart.data.datasets)) {
        console.log('Found chart data in data property');
        return {
          labels: currentChart.data.labels || [],
          datasets: currentChart.data.datasets || []
        };
      }
      
      // Check if data is in config or configuration property
      const chartConfig = currentChart.config || currentChart.configuration || {};
      console.log('Examining chart config:', chartConfig);
      
      // If config contains data directly
      if (chartConfig.data && (chartConfig.data.labels || chartConfig.data.datasets)) {
        console.log('Found chart data in config.data');
        return {
          labels: chartConfig.data.labels || [],
          datasets: chartConfig.data.datasets || []
        };
      }
      
      // Check for labels and datasets directly on config
      if (chartConfig.labels && chartConfig.datasets) {
        console.log('Found labels and datasets directly in config');
        return {
          labels: chartConfig.labels,
          datasets: chartConfig.datasets
        };
      }
      
      // Reconstruct chart data from xAxis, yAxis, and raw data if available
      if (currentChart.xAxis && currentChart.yAxis) {
        console.log('Reconstructing chart data from axis information');
        
        // Get labels from xAxis
        const labels = currentChart.xAxis.data || 
                      (currentChart.xAxis.field && currentChart.data?.source?.map(row => row[currentChart.xAxis.field])) ||
                      [];
        
        // Construct datasets from yAxis
        const yAxes = Array.isArray(currentChart.yAxis) ? currentChart.yAxis : [currentChart.yAxis];
        
        const datasets = yAxes.map((axis, index) => {
          // Generate a color for this dataset
          const colors = [
            '#60A5FA', '#34D399', '#F97316', '#A78BFA', '#EC4899', '#06B6D4'
          ];
          const color = colors[index % colors.length];
          
          return {
            label: axis.label || axis.field || `Dataset ${index + 1}`,
            data: axis.data || 
                 (axis.field && currentChart.data?.source?.map(row => row[axis.field])) ||
                 [],
            borderColor: color,
            backgroundColor: `${color}80`
          };
        });
        
        return {
          labels,
          datasets
        };
      }
      
      // Create default chart data if nothing else works
      console.warn('Could not extract valid chart data, creating default structure');
      return { 
        labels: ['No Data'], 
        datasets: [{ 
          label: 'No Data', 
          data: [0], 
          backgroundColor: '#60A5FA80',
          borderColor: '#60A5FA'
        }] 
      };
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return { 
        labels: ['Error'], 
        datasets: [{ 
          label: 'Error', 
          data: [0], 
          backgroundColor: '#EF444480',
          borderColor: '#EF4444'
        }] 
      };
    }
  };
  
  // Prepare chart data with proper styling
  const chartData = prepareChartData();
  
  // Check if chart data is valid
  if (!chartData || !chartData.labels || !chartData.datasets) {
    return (
      <div style={{
        display: 'flex',
        height: '70vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2 style={{
          fontSize: '1.25rem',
          fontWeight: 'bold',
          color: '#ef4444',
          marginBottom: '0.5rem'
        }}>Invalid chart data</h2>
        <p style={{
          marginTop: '0.5rem',
          color: theme === 'dark' ? styles.textColorSecondary : '#4b5563'
        }}>The chart data could not be processed correctly.</p>
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: theme === 'dark' ? '#1f2937' : '#f3f4f6',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          overflow: 'auto',
          maxWidth: '100%'
        }}>
          <pre>{JSON.stringify(currentChart, null, 2)}</pre>
        </div>
        <button
          onClick={() => navigate('/app/charts')}
          style={{
            marginTop: '1rem',
            borderRadius: '0.375rem',
            backgroundColor: styles.primaryColor,
            padding: '0.5rem 1rem',
            color: '#ffffff',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          Return to Charts
        </button>
      </div>
    );
  }
  
  // Enhanced commonOptions styling using theme properties
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? styles.textColor : '#374151',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 20,
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: currentChart.title,
        color: theme === 'dark' ? styles.textColor : '#374151',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? styles.tooltipBackground : 'rgba(255, 255, 255, 0.95)',
        titleColor: theme === 'dark' ? styles.tooltipText : '#111827',
        bodyColor: theme === 'dark' ? styles.tooltipText : '#374151',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)'
        },
        ticks: {
          color: theme === 'dark' ? styles.secondaryColor : '#374151',
          font: {
            size: 12
          }
        },
        border: {
          color: theme === 'dark' ? styles.borderColor : '#d1d5db'
        }
      },
      y: {
        grid: {
          color: theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.2)'
        },
        ticks: {
          color: theme === 'dark' ? styles.secondaryColor : '#374151',
          font: {
            size: 12
          }
        },
        border: {
          color: theme === 'dark' ? styles.borderColor : '#d1d5db'
        },
        beginAtZero: true
      }
    }
  };
  
  const renderAIInsightsSection = () => {
    if (!currentChart) return null;
    
    return (
      <div style={{
        marginTop: '2rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme === 'dark' ? styles.textColor : '#1f2937'
          }}>AI Insights</h2>
          
          <button
            onClick={() => setShowAdvancedInsights(!showAdvancedInsights)}
            style={{
              fontSize: '0.875rem',
              color: styles.primaryColor,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg 
              style={{ width: '1rem', height: '1rem' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={showAdvancedInsights 
                  ? "M13 10V3L4 14h7v7l9-11h-7z" 
                  : "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"}
              ></path>
            </svg>
            {showAdvancedInsights ? 'Show Basic Insights' : 'Show Advanced Insights'}
          </button>
        </div>
        
        {showAdvancedInsights ? (
          <AIAdvancedInsights
            chartId={currentChart._id}
            chartType={currentChart.type}
            chartData={currentChart.data}
            chartConfig={currentChart.configuration}
            insightsText={currentChart.aiInsights}
            onInsightsGenerated={handleInsightsGenerated}
          />
        ) : (
          <AIInsights
            data={currentChart.data?.source || []}
            columns={currentChart.configuration?.columns || []}
            selectedColumns={{
              x: currentChart.xAxis?.field,
              y: [currentChart.yAxis?.field]
            }}
            chartType={currentChart.type}
            insightsText={currentChart.aiInsights}
            onInsightsGenerated={handleInsightsGenerated}
            chartId={currentChart._id}
          />
        )}
      </div>
    );
  };
  
  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '1rem'
    }}>
      <div style={{
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {isEditing ? (
          <input
            type="text"
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: theme === 'dark' ? styles.textColor : '#1f2937',
              backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.8)',
              outline: 'none',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: `2px solid ${styles.primaryColor}`
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: theme === 'dark' ? styles.textColor : '#1f2937',
              margin: 0
            }}>{currentChart.title}</h1>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: styles.primaryColor,
                padding: 0,
                display: 'flex'
              }}
              title="Edit chart name"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button
            onClick={() => navigate(`/app/files/${currentChart.excelFile}`)}
            style={{
              borderRadius: '0.375rem',
              backgroundColor: styles.buttonPrimaryBackground,
              padding: '0.5rem 1rem',
              color: styles.buttonPrimaryText,
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              boxShadow: theme === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            View Source File
          </button>
          <button
            onClick={() => navigate('/app/charts')}
            style={{
              borderRadius: '0.375rem',
              border: `1px solid ${theme === 'dark' ? styles.borderColor : '#d1d5db'}`,
              padding: '0.5rem 1rem',
              color: theme === 'dark' ? styles.secondaryColor : '#374151',
              backgroundColor: theme === 'dark' ? 'transparent' : '#ffffff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: theme === 'dark' ? 'none' : '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            Back to Charts
          </button>
        </div>
      </div>
      
      {/* Desktop layout (hidden on mobile/tablet) */}
      <div className="hidden lg:grid grid-cols-3 gap-6">
        {/* Chart Display */}
        <div className="col-span-2" style={{
          borderRadius: '0.5rem',
          backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
          padding: '1.5rem',
          boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          <div style={{ 
            height: '500px',
            borderRadius: '0.25rem',
            overflow: 'hidden'
          }} ref={chartRef}>
            {currentChart.type && currentChart.type.includes('3d') ? (
              <Interactive3DChart
                data={currentChart.data?.source || 
                      (currentChart.config?.source) || 
                      (currentChart.configuration?.source) ||
                      (Array.isArray(currentChart.config) ? currentChart.config : 
                       Array.isArray(currentChart.configuration) ? currentChart.configuration : [])}
                chartType={currentChart.type.replace('3d-', '')}
                chartTitle={currentChart.title}
                selectedColumns={{
                  x: currentChart.xAxis?.field || currentChart.xAxis,
                  y: Array.isArray(currentChart.yAxis) 
                     ? currentChart.yAxis.map(y => y.field || y) 
                     : [currentChart.yAxis?.field || currentChart.yAxis],
                  z: currentChart.zAxis?.field || currentChart.zAxis
                }}
                config={{
                  showLabels: true,
                  showGrid: true,
                  ...currentChart.config?.chartConfig,
                  ...currentChart.configuration?.chartConfig
                }}
              />
            ) : (
              <>
                {currentChart.type === 'bar' && (
                  <Bar data={chartData} options={commonOptions} />
                )}
                {currentChart.type === 'line' && (
                  <Line data={chartData} options={commonOptions} />
                )}
                {currentChart.type === 'pie' && (
                  <Pie data={chartData} options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        position: 'right'
                      }
                    }
                  }} />
                )}
                {currentChart.type === 'doughnut' && (
                  <Doughnut data={chartData} options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        position: 'right'
                      }
                    },
                    cutout: '70%'
                  }} />
                )}
                {currentChart.type === 'polarArea' && (
                  <PolarArea data={chartData} options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        position: 'right'
                      }
                    }
                  }} />
                )}
                {currentChart.type === 'radar' && (
                  <Radar data={chartData} options={{
                    ...commonOptions,
                    scales: {
                      r: {
                        angleLines: {
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        grid: {
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? styles.secondaryColor : '#374151',
                          backdropColor: 'transparent'
                        },
                        pointLabels: {
                          color: theme === 'dark' ? styles.secondaryColor : '#374151'
                        }
                      }
                    }
                  }} />
                )}
                {currentChart.type === 'horizontalBar' && (
                  <Bar 
                    data={chartData} 
                    options={{
                      ...commonOptions,
                      indexAxis: 'y'
                    }} 
                  />
                )}
                {currentChart.type === 'bubble' && (
                  <Bubble data={chartData} options={commonOptions} />
                )}
                {currentChart.type === 'scatter' && (
                  <Scatter data={chartData} options={commonOptions} />
                )}
                {currentChart.type === 'area' && (
                  <Line 
                    data={{
                      ...chartData,
                      datasets: chartData.datasets.map(dataset => ({
                        ...dataset,
                        fill: true
                      }))
                    }} 
                    options={commonOptions} 
                  />
                )}
                {currentChart.type === 'stackedBar' && (
                  <Bar 
                    data={chartData} 
                    options={{
                      ...commonOptions,
                      scales: {
                        ...commonOptions.scales,
                        x: {
                          ...commonOptions.scales.x,
                          stacked: true
                        },
                        y: {
                          ...commonOptions.scales.y,
                          stacked: true
                        }
                      }
                    }} 
                  />
                )}
                {currentChart.type === 'mixed' && (
                  <Bar 
                    data={{
                      ...chartData,
                      datasets: chartData.datasets.map((dataset, index) => ({
                        ...dataset,
                        type: index % 2 === 0 ? 'bar' : 'line'
                      }))
                    }} 
                    options={commonOptions} 
                  />
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Chart Controls */}
        <div style={{
          borderRadius: '0.5rem',
          backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
          padding: '1.5rem',
          boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{
            marginBottom: '1rem',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme === 'dark' ? styles.textColor : '#1f2937'
          }}>Chart Controls</h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme === 'dark' ? styles.secondaryColor : '#4b5563',
                marginBottom: '0.25rem'
              }}>
                Chart Type
              </label>
              {isEditing ? (
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '0.375rem',
                    border: `1px solid ${theme === 'dark' ? styles.borderColor : '#d1d5db'}`,
                    backgroundColor: theme === 'dark' ? styles.inputBackground : '#ffffff',
                    padding: '0.5rem 0.75rem',
                    color: theme === 'dark' ? styles.textColor : '#1f2937',
                    cursor: 'pointer'
                  }}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                  <option value="polarArea">Polar Area Chart</option>
                  <option value="radar">Radar Chart</option>
                  <option value="horizontalBar">Horizontal Bar Chart</option>
                  <option value="bubble">Bubble Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="area">Area Chart</option>
                  <option value="stackedBar">Stacked Bar Chart</option>
                  <option value="mixed">Mixed Chart</option>
                  <option value="3d-column">3D Column Chart</option>
                  <option value="3d-bar">3D Bar Chart</option>
                  <option value="3d-scatter">3D Scatter Chart</option>
                </select>
              ) : (
                <p style={{
                  color: theme === 'dark' ? styles.secondaryColor : '#4b5563',
                  backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.8)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  marginTop: '0.25rem'
                }}>{currentChart.type}</p>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveChanges}
                    style={{
                      flex: '1',
                      borderRadius: '0.375rem',
                      backgroundColor: styles.buttonPrimaryBackground,
                      padding: '0.5rem 1rem',
                      color: styles.buttonPrimaryText,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      boxShadow: theme === 'dark' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      borderRadius: '0.375rem',
                      border: `1px solid ${theme === 'dark' ? styles.borderColor : '#d1d5db'}`,
                      padding: '0.5rem 1rem',
                      color: theme === 'dark' ? styles.secondaryColor : '#4b5563',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    flex: '1',
                    borderRadius: '0.375rem',
                    backgroundColor: theme === 'dark' ? styles.buttonSecondaryBackground : styles.buttonSecondaryBackground,
                    padding: '0.5rem 1rem',
                    color: theme === 'dark' ? styles.secondaryColor : '#4b5563',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Chart
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={downloadAsPDF}
                style={{
                  flex: '1',
                  borderRadius: '0.375rem',
                  backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                  padding: '0.5rem 1rem',
                  color: theme === 'dark' ? styles.successColor : '#047857',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                PDF
              </button>
              <button
                onClick={downloadAsImage}
                style={{
                  flex: '1',
                  borderRadius: '0.375rem',
                  backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                  padding: '0.5rem 1rem',
                  color: theme === 'dark' ? styles.infoColor : '#1e40af',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Image
              </button>
            </div>

            {/* Save as template button */}
            <button
              onClick={() => {
                const templateName = window.prompt('Enter a name for this template:');
                if (templateName && templateName.trim()) {
                  dispatch(saveChartAsTemplate({
                    id: currentChart._id,
                    templateName: templateName.trim()
                  }))
                    .unwrap()
                    .then(() => toast.success('Chart saved as template'))
                    .catch(err => toast.error('Error saving template: ' + err));
                }
              }}
              style={{
                width: '100%',
                borderRadius: '0.375rem',
                backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.1)' : '#f5f3ff',
                padding: '0.5rem 1rem',
                color: theme === 'dark' ? '#a78bfa' : '#6d28d9',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
              </svg>
              Save as Template
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                width: '100%',
                borderRadius: '0.375rem',
                border: `1px solid ${theme === 'dark' ? '#ef4444' : '#fca5a5'}`,
                padding: '0.5rem 1rem',
                color: theme === 'dark' ? styles.dangerColor : '#dc2626',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete Chart
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet layout (hidden on desktop) */}
      <div className="flex flex-col gap-6 lg:hidden">
        {/* Chart Display */}
        <div style={{
          borderRadius: '0.5rem',
          backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
          padding: '1.5rem',
          boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          <div style={{ 
            height: '500px',
            borderRadius: '0.25rem',
            overflow: 'hidden'
          }}>
            {currentChart.type && currentChart.type.includes('3d') ? (
              <Interactive3DChart
                data={currentChart.data?.source || 
                      (currentChart.config?.source) || 
                      (currentChart.configuration?.source) ||
                      (Array.isArray(currentChart.config) ? currentChart.config : 
                       Array.isArray(currentChart.configuration) ? currentChart.configuration : [])}
                chartType={currentChart.type.replace('3d-', '')}
                chartTitle={currentChart.title}
                selectedColumns={{
                  x: currentChart.xAxis?.field || currentChart.xAxis,
                  y: Array.isArray(currentChart.yAxis) 
                     ? currentChart.yAxis.map(y => y.field || y) 
                     : [currentChart.yAxis?.field || currentChart.yAxis],
                  z: currentChart.zAxis?.field || currentChart.zAxis
                }}
                config={{
                  showLabels: true,
                  showGrid: true,
                  ...currentChart.config?.chartConfig,
                  ...currentChart.configuration?.chartConfig
                }}
              />
            ) : (
              <>
                {currentChart.type === 'bar' && (
                  <Bar data={chartData} options={commonOptions} />
                )}
                {currentChart.type === 'line' && (
                  <Line data={chartData} options={commonOptions} />
                )}
                {currentChart.type === 'pie' && (
                  <Pie data={chartData} options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        position: 'right'
                      }
                    }
                  }} />
                )}
                {currentChart.type === 'doughnut' && (
                  <Doughnut data={chartData} options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        position: 'right'
                      }
                    },
                    cutout: '70%'
                  }} />
                )}
                {currentChart.type === 'polarArea' && (
                  <PolarArea data={chartData} options={{
                    ...commonOptions,
                    plugins: {
                      ...commonOptions.plugins,
                      legend: {
                        ...commonOptions.plugins.legend,
                        position: 'right'
                      }
                    }
                  }} />
                )}
                {currentChart.type === 'radar' && (
                  <Radar data={chartData} options={{
                    ...commonOptions,
                    scales: {
                      r: {
                        angleLines: {
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        grid: {
                          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                          color: theme === 'dark' ? styles.secondaryColor : '#374151',
                          backdropColor: 'transparent'
                        },
                        pointLabels: {
                          color: theme === 'dark' ? styles.secondaryColor : '#374151'
                        }
                      }
                    }
                  }} />
                )}
                {currentChart.type === 'horizontalBar' && (
                  <Bar 
                    data={chartData} 
                    options={{
                      ...commonOptions,
                      indexAxis: 'y'
                    }} 
                  />
                )}
                {currentChart.type === 'bubble' && (
                  <Bubble data={chartData} options={commonOptions} />
                )}
                {currentChart.type === 'scatter' && (
                  <Scatter data={chartData} options={commonOptions} />
                )}
                {currentChart.type === 'area' && (
                  <Line 
                    data={{
                      ...chartData,
                      datasets: chartData.datasets.map(dataset => ({
                        ...dataset,
                        fill: true
                      }))
                    }} 
                    options={commonOptions} 
                  />
                )}
                {currentChart.type === 'stackedBar' && (
                  <Bar 
                    data={chartData} 
                    options={{
                      ...commonOptions,
                      scales: {
                        ...commonOptions.scales,
                        x: {
                          ...commonOptions.scales.x,
                          stacked: true
                        },
                        y: {
                          ...commonOptions.scales.y,
                          stacked: true
                        }
                      }
                    }} 
                  />
                )}
                {currentChart.type === 'mixed' && (
                  <Bar 
                    data={{
                      ...chartData,
                      datasets: chartData.datasets.map((dataset, index) => ({
                        ...dataset,
                        type: index % 2 === 0 ? 'bar' : 'line'
                      }))
                    }} 
                    options={commonOptions} 
                  />
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Chart Controls */}
        <div style={{
          borderRadius: '0.5rem',
          backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
          padding: '1.5rem',
          boxShadow: theme === 'dark' ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{
            marginBottom: '1rem',
            fontSize: '1.25rem',
            fontWeight: '600',
            color: theme === 'dark' ? styles.textColor : '#1f2937'
          }}>Chart Controls</h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: theme === 'dark' ? styles.secondaryColor : '#4b5563',
                marginBottom: '0.25rem'
              }}>
                Chart Type
              </label>
              {isEditing ? (
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  style={{
                    width: '100%',
                    borderRadius: '0.375rem',
                    border: `1px solid ${theme === 'dark' ? styles.borderColor : '#d1d5db'}`,
                    backgroundColor: theme === 'dark' ? styles.inputBackground : '#ffffff',
                    padding: '0.5rem 0.75rem',
                    color: theme === 'dark' ? styles.textColor : '#1f2937',
                    cursor: 'pointer'
                  }}
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="pie">Pie Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                  <option value="polarArea">Polar Area Chart</option>
                  <option value="radar">Radar Chart</option>
                  <option value="horizontalBar">Horizontal Bar Chart</option>
                  <option value="bubble">Bubble Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="area">Area Chart</option>
                  <option value="stackedBar">Stacked Bar Chart</option>
                  <option value="mixed">Mixed Chart</option>
                  <option value="3d-column">3D Column Chart</option>
                  <option value="3d-bar">3D Bar Chart</option>
                  <option value="3d-scatter">3D Scatter Chart</option>
                </select>
              ) : (
                <p style={{
                  color: theme === 'dark' ? styles.secondaryColor : '#4b5563',
                  backgroundColor: theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.8)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '0.375rem',
                  marginTop: '0.25rem'
                }}>{currentChart.type}</p>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveChanges}
                    style={{
                      flex: '1',
                      borderRadius: '0.375rem',
                      backgroundColor: styles.buttonPrimaryBackground,
                      padding: '0.5rem 1rem',
                      color: styles.buttonPrimaryText,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      boxShadow: theme === 'dark' ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    style={{
                      borderRadius: '0.375rem',
                      border: `1px solid ${theme === 'dark' ? styles.borderColor : '#d1d5db'}`,
                      padding: '0.5rem 1rem',
                      color: theme === 'dark' ? styles.secondaryColor : '#4b5563',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    flex: '1',
                    borderRadius: '0.375rem',
                    backgroundColor: theme === 'dark' ? styles.buttonSecondaryBackground : styles.buttonSecondaryBackground,
                    padding: '0.5rem 1rem',
                    color: theme === 'dark' ? styles.secondaryColor : '#4b5563',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit Chart
                </button>
              )}
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <button
                onClick={downloadAsPDF}
                style={{
                  flex: '1',
                  borderRadius: '0.375rem',
                  backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5',
                  padding: '0.5rem 1rem',
                  color: theme === 'dark' ? styles.successColor : '#047857',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                PDF
              </button>
              <button
                onClick={downloadAsImage}
                style={{
                  flex: '1',
                  borderRadius: '0.375rem',
                  backgroundColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff',
                  padding: '0.5rem 1rem',
                  color: theme === 'dark' ? styles.infoColor : '#1e40af',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Image
              </button>
            </div>

            {/* Save as template button */}
            <button
              onClick={() => {
                const templateName = window.prompt('Enter a name for this template:');
                if (templateName && templateName.trim()) {
                  dispatch(saveChartAsTemplate({
                    id: currentChart._id,
                    templateName: templateName.trim()
                  }))
                    .unwrap()
                    .then(() => toast.success('Chart saved as template'))
                    .catch(err => toast.error('Error saving template: ' + err));
                }
              }}
              style={{
                width: '100%',
                borderRadius: '0.375rem',
                backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.1)' : '#f5f3ff',
                padding: '0.5rem 1rem',
                color: theme === 'dark' ? '#a78bfa' : '#6d28d9',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"></path>
              </svg>
              Save as Template
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              style={{
                width: '100%',
                borderRadius: '0.375rem',
                border: `1px solid ${theme === 'dark' ? '#ef4444' : '#fca5a5'}`,
                padding: '0.5rem 1rem',
                color: theme === 'dark' ? styles.dangerColor : '#dc2626',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete Chart
            </button>
          </div>
        </div>
      </div>

      {renderAIInsightsSection()}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          zIndex: '50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '28rem',
            borderRadius: '0.5rem',
            backgroundColor: theme === 'dark' ? styles.modalBackground : '#ffffff',
            color: theme === 'dark' ? styles.textColor : '#1f2937',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            margin: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              gap: '0.75rem'
            }}>
              <svg style={{ 
                width: '1.5rem', 
                height: '1.5rem',
                color: theme === 'dark' ? styles.dangerColor : '#dc2626'
              }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: theme === 'dark' ? styles.textColor : '#1f2937'
              }}>Confirm Deletion</h3>
            </div>
            <p style={{
              marginBottom: '1.5rem',
              color: theme === 'dark' ? styles.secondaryColor : '#4b5563'
            }}>
              Are you sure you want to delete <span style={{ fontWeight: '500' }}>{currentChart.title}</span>? This action
              cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  borderRadius: '0.375rem',
                  border: `1px solid ${theme === 'dark' ? styles.borderColor : '#d1d5db'}`,
                  padding: '0.5rem 1rem',
                  color: theme === 'dark' ? styles.secondaryColor : '#374151',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChart}
              style={{
                  borderRadius: '0.375rem',
                  backgroundColor: styles.dangerColor,
                  padding: '0.5rem 1rem',
                color: 'white',
                  border: 'none',
                  cursor: 'pointer'
              }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartDetails; 