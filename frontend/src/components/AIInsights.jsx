import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  SparklesIcon, 
  ChartBarIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { generateChartInsights } from '../redux/chart/chartSlice';
import { useTheme } from '../contexts/ThemeContext';

const AIInsights = ({ 
  data, 
  columns, 
  selectedColumns,
  chartType,
  insightsText = null,
  onInsightsGenerated,
  chartId
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(insightsText);
  const dispatch = useDispatch();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const generateInsights = async () => {
    if (!data || !selectedColumns.x || selectedColumns.y.length === 0) {
      toast.error('Please select chart axes first');
      return;
    }

    if (!chartId) {
      toast.error('Chart ID is required');
      return;
    }

    setIsLoading(true);
    
    try {
      // Prepare data summary for AI
      const dataSnapshot = data.slice(0, 50); // Take a sample of the data
      const columnInfo = columns.map(col => ({
        name: col.name,
        type: !isNaN(Number(col.sample)) ? 'numeric' : 'categorical',
        sample: col.sample
      }));
      
      // Log the payload for debugging
      console.log('Sending insights request with payload:', {
        chartId,
        dataSnapshot: dataSnapshot.length,
        columnInfo: columnInfo.length,
        selectedColumns,
        chartType
      });
      
      // Request AI insights from backend
      const payload = {
        chartId,
        dataSnapshot,
        columnInfo,
        selectedColumns,
        chartType
      };
      
      const result = await dispatch(generateChartInsights(payload)).unwrap();
      
      if (result && result.insights) {
        setInsights(result.insights);
        
        // Notify parent component of new insights
        if (onInsightsGenerated) {
          onInsightsGenerated(result.insights);
        }
        
        toast.success('AI insights generated successfully');
      } else {
        toast.error('Failed to generate insights: No insights data returned');
        console.error('Insights API returned success but no insights data:', result);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      let errorMessage = 'Unknown error';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Check for specific errors
      if (errorMessage.includes('sheets') || errorMessage.includes('Excel file not found')) {
        errorMessage = 'Source Excel file not found or not properly linked to this chart. Try refreshing the page or re-uploading the file.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'API endpoint not found. Please contact support.';
      } else if (errorMessage.includes('Network Error')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      toast.error('Error generating insights: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Sample insights to show when real insights unavailable (for UI demo)
  const getSampleInsights = () => {
    const types = {
      bar: "This bar chart shows a clear trend of increasing values across categories. The highest values are observed in category X, while category Y shows the lowest performance.",
      line: "The line chart reveals a cyclical pattern with peaks occurring every 3-4 data points. There's a general upward trend suggesting growth over time.",
      pie: "The pie chart shows that category A dominates with 45% of the total, followed by category B at 25%. The remaining categories each represent less than 10%.",
      scatter: "The scatter plot indicates a positive correlation between the X and Y variables, with an R² value of approximately 0.78.",
      doughnut: "The doughnut chart reveals that 3 categories make up over 70% of the total distribution, suggesting a concentration in these areas.",
      polarArea: "The polar area chart shows that while category A has the largest value, category B covers the largest area due to its angular width.",
      radar: "The radar chart demonstrates that this entity has balanced performance across all measured dimensions, with slightly higher values in dimensions X and Y.",
      bubble: "The bubble chart shows clustering of larger values in the upper right quadrant, suggesting a positive correlation between all three variables.",
      column: "The 3D column chart reveals that the highest values are concentrated in the back-right section, with a gradual decrease toward the front-left.",
      '3d-scatter': "The 3D scatter plot shows data points forming a distinct pattern resembling a curved surface, indicating a non-linear relationship between the three variables."
    };
    
    return types[chartType] || "This chart reveals important patterns in your data. The distribution shows significant variation across different categories, with notable outliers in some areas.";
  };

  return (
    <div style={{
      backgroundColor: theme === 'dark' ? styles.cardBackground : '#ffffff',
      borderRadius: '0.5rem',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: `1px solid ${theme === 'dark' ? styles.borderColor : '#e5e7eb'}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <SparklesIcon style={{ 
            height: '1.25rem', 
            width: '1.25rem', 
            color: theme === 'dark' ? '#a78bfa' : '#8b5cf6' 
          }} />
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '500',
            color: theme === 'dark' ? styles.textColor : '#1f2937'
          }}>
            AI Insights
          </h3>
        </div>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.25rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.1)' : '#f5f3ff',
            color: theme === 'dark' ? '#a78bfa' : '#8b5cf6',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? (
            <>
              <ArrowPathIcon style={{ 
                height: '1rem', 
                width: '1rem', 
                marginRight: '0.375rem',
                animation: 'spin 1s linear infinite'
              }} />
              Analyzing...
            </>
          ) : (
            <>
              <ChartBarIcon style={{ height: '1rem', width: '1rem', marginRight: '0.375rem' }} />
              Generate Insights
            </>
          )}
        </button>
      </div>
      <div style={{ padding: '1rem' }}>
        {insights ? (
          <div style={{ maxWidth: 'none' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem' 
            }}>
              <CheckCircleIcon style={{ 
                height: '1.25rem', 
                width: '1.25rem', 
                color: theme === 'dark' ? '#34d399' : '#10b981',
                marginTop: '0.125rem',
                flexShrink: 0
              }} />
              <div>
                {insights.split('\n\n').map((paragraph, i) => (
                  <p key={i} style={{
                    color: theme === 'dark' ? styles.textColorSecondary : '#4b5563',
                    marginBottom: '0.75rem',
                    lineHeight: '1.5'
                  }}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center',
            padding: '1.5rem 1rem' 
          }}>
            <div style={{
              backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.1)' : '#f5f3ff',
              padding: '1rem',
              borderRadius: '0.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <SparklesIcon style={{ 
                height: '2rem', 
                width: '2rem', 
                color: theme === 'dark' ? '#a78bfa' : '#8b5cf6' 
              }} />
            </div>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: theme === 'dark' ? styles.textColor : '#111827',
              marginBottom: '0.5rem'
            }}>
              Generate AI Insights
            </h4>
            <p style={{
              fontSize: '0.875rem',
              color: theme === 'dark' ? styles.textColorSecondary : '#6b7280',
              maxWidth: '28rem',
              margin: '0 auto'
            }}>
              Click the button above to analyze your data and receive AI-powered insights about trends, patterns, and notable observations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights; 