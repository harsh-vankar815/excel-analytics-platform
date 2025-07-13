import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  SparklesIcon, 
  LightBulbIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ChartPieIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { generateChartInsights } from '../redux/chart/chartSlice';
import { useTheme } from '../contexts/ThemeContext';

const AIAdvancedInsights = ({ 
  chartId,
  chartType,
  chartData,
  chartConfig,
  insightsText = null,
  onInsightsGenerated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(insightsText);
  const [activeTab, setActiveTab] = useState('summary');
  const dispatch = useDispatch();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const generateAdvancedInsights = async () => {
    if (!chartId || !chartData) {
      toast.error('Chart data is required');
      return;
    }

    setIsLoading(true);
    
    try {
      // Extract the necessary data for the backend
      const dataSnapshot = chartData.source || chartData.datasets?.[0]?.data || [];
      
      // Extract column info from the data
      let columnInfo = {};
      if (dataSnapshot && dataSnapshot.length > 0) {
        const firstRow = dataSnapshot[0];
        Object.keys(firstRow).forEach(key => {
          columnInfo[key] = {
            name: key,
            type: typeof firstRow[key] === 'number' ? 'number' : 'string'
          };
        });
      }
      
      // Extract selected columns from chartConfig
      const selectedColumns = {
        x: chartConfig?.xAxis?.dataKey || Object.keys(columnInfo)[0] || '',
        y: chartConfig?.yAxis?.map(y => y.dataKey) || 
           [chartConfig?.yAxis?.dataKey] || 
           [Object.keys(columnInfo)[1] || '']
      };
      
      // Add z-axis for 3D charts if available
      if (chartConfig?.zAxis?.dataKey) {
        selectedColumns.z = chartConfig.zAxis.dataKey;
      }
      
      // Log payload for debugging
      console.log('Sending advanced insights request with payload:', {
        chartId,
        chartType,
        dataSnapshot,
        columnInfo,
        selectedColumns
      });
      
      // Prepare data for AI analysis
      const payload = {
        chartId,
        chartType,
        dataSnapshot,
        columnInfo,
        selectedColumns,
        analysisType: 'advanced'
      };
      
      const result = await dispatch(generateChartInsights(payload)).unwrap();
      
      if (result && result.insights) {
        setInsights(result.insights);
        
        // Notify parent component of new insights
        if (onInsightsGenerated) {
          onInsightsGenerated(result.insights);
        }
        
        toast.success('Advanced AI insights generated successfully');
      } else {
        toast.error('Failed to generate insights: No insights data returned');
        console.error('Insights API returned success but no insights data:', result);
      }
    } catch (error) {
      console.error('Error generating advanced insights:', error);
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
      } else if (errorMessage.includes('data snapshot') || errorMessage.includes('column info') || errorMessage.includes('selected columns')) {
        errorMessage = 'Missing required data for insight generation. Please ensure your chart has valid data and configuration.';
      }
      
      toast.error('Error generating insights: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse insights into sections if they exist
  const parsedInsights = insights ? parseInsights(insights) : null;

  // Helper function to get tab button style
  const getTabStyle = (tabName) => {
    const isActive = activeTab === tabName;
    return {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderBottom: '2px solid',
      borderBottomColor: isActive 
        ? (theme === 'dark' ? '#a78bfa' : '#8b5cf6') 
        : 'transparent',
      color: isActive
        ? (theme === 'dark' ? '#a78bfa' : '#8b5cf6')
        : (theme === 'dark' ? styles.textColorSecondary : '#6b7280'),
      cursor: 'pointer',
      background: 'none',
      border: 'none',
      outline: 'none'
    };
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
            Advanced AI Insights
          </h3>
        </div>
        <button
          onClick={generateAdvancedInsights}
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
              <LightBulbIcon style={{ height: '1rem', width: '1rem', marginRight: '0.375rem' }} />
              Generate Advanced Insights
            </>
          )}
        </button>
      </div>
      
      {insights ? (
        <div>
          {/* Tabs for different insight sections */}
          <div style={{
            borderBottom: `1px solid ${theme === 'dark' ? styles.borderColor : '#e5e7eb'}`
          }}>
            <nav style={{
              display: 'flex',
              overflowX: 'auto'
            }} aria-label="Tabs">
              <button
                onClick={() => setActiveTab('summary')}
                style={getTabStyle('summary')}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('patterns')}
                style={getTabStyle('patterns')}
              >
                Patterns & Trends
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                style={getTabStyle('recommendations')}
              >
                Recommendations
              </button>
            </nav>
          </div>
          
          {/* Content for active tab */}
          <div style={{ padding: '1rem' }}>
            {activeTab === 'summary' && (
              <div style={{ maxWidth: 'none' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem' 
                }}>
                  <ChartBarIcon style={{ 
                    height: '1.25rem', 
                    width: '1.25rem', 
                    color: theme === 'dark' ? '#a78bfa' : '#8b5cf6',
                    marginTop: '0.125rem',
                    flexShrink: 0
                  }} />
                  <div>
                    {parsedInsights.summary.map((paragraph, i) => (
                      <p 
                        key={i} 
                        style={{
                          color: theme === 'dark' ? styles.textColorSecondary : '#4b5563',
                          marginBottom: '0.75rem',
                          lineHeight: '1.5'
                        }}
                      >
                        {paragraph.startsWith('- ') ? (
                          <span>• {paragraph.substring(2)}</span>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'patterns' && (
              <div style={{ maxWidth: 'none' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem' 
                }}>
                  <ChartPieIcon style={{ 
                    height: '1.25rem', 
                    width: '1.25rem', 
                    color: theme === 'dark' ? '#a78bfa' : '#8b5cf6',
                    marginTop: '0.125rem',
                    flexShrink: 0
                  }} />
                  <div>
                    {parsedInsights.patterns.map((paragraph, i) => (
                      <p 
                        key={i} 
                        style={{
                          color: theme === 'dark' ? styles.textColorSecondary : '#4b5563',
                          marginBottom: '0.75rem',
                          lineHeight: '1.5'
                        }}
                      >
                        {paragraph.startsWith('- ') ? (
                          <span>• {paragraph.substring(2)}</span>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'recommendations' && (
              <div style={{ maxWidth: 'none' }}>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem' 
                }}>
                  <TableCellsIcon style={{ 
                    height: '1.25rem', 
                    width: '1.25rem', 
                    color: theme === 'dark' ? '#a78bfa' : '#8b5cf6',
                    marginTop: '0.125rem',
                    flexShrink: 0
                  }} />
                  <div>
                    {parsedInsights.recommendations.map((paragraph, i) => (
                      <p 
                        key={i} 
                        style={{
                          color: theme === 'dark' ? styles.textColorSecondary : '#4b5563',
                          marginBottom: '0.75rem',
                          lineHeight: '1.5'
                        }}
                      >
                        {paragraph.startsWith('- ') ? (
                          <span>• {paragraph.substring(2)}</span>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
            Generate Advanced AI Insights
          </h4>
          <p style={{
            fontSize: '0.875rem',
            color: theme === 'dark' ? styles.textColorSecondary : '#6b7280',
            maxWidth: '28rem',
            margin: '0 auto'
          }}>
            Click the button above to analyze your chart data with our advanced AI algorithms. 
            Discover hidden patterns, correlations, and get actionable recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

// Helper function to parse insights into sections
const parseInsights = (insights) => {
  // Default structure if parsing fails
  const defaultStructure = {
    summary: [insights],
    patterns: ["No pattern data available."],
    recommendations: ["No recommendations available."]
  };
  
  try {
    // Check if insights has section markers
    if (insights.includes('## Summary') || 
        insights.includes('## Patterns') || 
        insights.includes('## Recommendations')) {
      
      const sections = {
        summary: [],
        patterns: [],
        recommendations: []
      };
      
      let currentSection = 'summary';
      
      // Split by lines and process
      const lines = insights.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check for section headers
        if (line === '## Summary') {
          currentSection = 'summary';
          continue;
        } else if (line === '## Patterns' || line === '## Trends' || line === '## Patterns & Trends') {
          currentSection = 'patterns';
          continue;
        } else if (line === '## Recommendations' || line === '## Suggestions') {
          currentSection = 'recommendations';
          continue;
        }
        
        // Skip empty lines
        if (!line) continue;
        
        // Add line to current section
        sections[currentSection].push(line);
      }
      
      // If any section is empty, provide default content
      if (sections.summary.length === 0) {
        sections.summary = ["No summary information available."];
      }
      if (sections.patterns.length === 0) {
        sections.patterns = ["No pattern data available."];
      }
      if (sections.recommendations.length === 0) {
        sections.recommendations = ["No recommendations available."];
      }
      
      return sections;
    } else {
      // Try to intelligently divide the insights
      const lines = insights.split('\n').filter(line => line.trim());
      
      if (lines.length >= 6) {
        // If there are enough lines, divide them into three sections
        const third = Math.floor(lines.length / 3);
        return {
          summary: lines.slice(0, third),
          patterns: lines.slice(third, third * 2),
          recommendations: lines.slice(third * 2)
        };
      } else {
        // Not enough content to divide meaningfully
        return defaultStructure;
      }
    }
  } catch (error) {
    console.error('Error parsing insights:', error);
    return defaultStructure;
  }
};

export default AIAdvancedInsights;