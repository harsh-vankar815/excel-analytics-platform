import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { generateFileSummary, setFileSummary } from '../redux/file/fileSlice';
import { useTheme } from '../contexts/ThemeContext';

// Helper function to parse the summary into sections
const parseSummary = (summaryText) => {
  if (!summaryText) return [];
  
  // Check if the summary has section headers (## Section)
  const hasHeaders = summaryText.includes('## ');
  
  if (hasHeaders) {
    // Split by section headers
    const sections = [];
    const regex = /## ([^\n]+)([\s\S]*?)(?=## |$)/g;
    let match;
    
    while ((match = regex.exec(summaryText)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      
      sections.push({
        title,
        content: content.split('\n').filter(line => line.trim())
      });
    }
    
    return sections;
  } else {
    // Just split by paragraphs if no headers
    return [{
      title: 'Summary',
      content: summaryText.split('\n\n').filter(p => p.trim())
    }];
  }
};

const AIInsightsSummary = ({ 
  fileId,
  fileName,
  summaryText = null,
  onSummaryGenerated,
  theme: propTheme,
  styles: propStyles
}) => {
  const dispatch = useDispatch();
  const { isLoading, fileSummary: reduxFileSummary } = useSelector(state => state.file);
  const [summary, setSummary] = useState(summaryText || reduxFileSummary);
  const { theme: contextTheme, getThemeStyles } = useTheme();
  
  // Use props if provided, otherwise use context
  const theme = propTheme || contextTheme;
  const styles = propStyles || getThemeStyles();

  // Update local state when Redux state changes
  useEffect(() => {
    if (reduxFileSummary) {
      setSummary(reduxFileSummary);
      if (onSummaryGenerated) {
        onSummaryGenerated(reduxFileSummary);
      }
    }
  }, [reduxFileSummary, onSummaryGenerated]);

  // Update local state when prop changes
  useEffect(() => {
    if (summaryText) {
      setSummary(summaryText);
      dispatch(setFileSummary(summaryText));
    }
  }, [summaryText, dispatch]);

  const generateSummary = async () => {
    if (!fileId) {
      toast.error('File ID is required');
      return;
    }

    try {
      const result = await dispatch(generateFileSummary(fileId)).unwrap();
      
      if (result && result.data && result.data.summary) {
        setSummary(result.data.summary);
        
        // Notify parent component of new summary
        if (onSummaryGenerated) {
          onSummaryGenerated(result.data.summary);
        }
        
        toast.success('AI summary generated successfully');
      } else {
        toast.error('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Error generating summary: ' + (error.message || 'Unknown error'));
    }
  };

  // Parse the summary into sections
  const sections = parseSummary(summary);

  return (
    <div style={{
      backgroundColor: theme === 'dark' ? styles.cardBackground : styles.cardBackground,
      color: theme === 'dark' ? styles.textColor : styles.textColor,
      boxShadow: `0 1px 3px ${styles.shadowColor}`
    }} className="rounded-lg overflow-hidden">
      <div style={{
        borderBottomWidth: '1px',
        borderColor: theme === 'dark' ? styles.borderColor : styles.borderColor
      }} className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-5 w-5 text-purple-500" />
          <h3 style={{ color: theme === 'dark' ? styles.textColor : styles.textColor }} className="text-lg font-medium">
            AI Summary Report
          </h3>
        </div>
        <button
          onClick={generateSummary}
          disabled={isLoading}
          className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${
            isLoading
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-400 cursor-not-allowed'
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
          }`}
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-1.5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <DocumentTextIcon className="h-4 w-4 mr-1.5" />
              {summary ? 'Regenerate Summary' : 'Generate Summary'}
            </>
          )}
        </button>
      </div>
      <div className="p-4">
        {summary ? (
          <div className="prose prose-sm max-w-none" style={{
            color: theme === 'dark' ? styles.textColor : styles.textColor
          }}>
            <div className="space-y-6">
              {sections.map((section, i) => (
                <div key={i} className="space-y-2">
                  <h3 style={{ color: theme === 'dark' ? styles.textColor : styles.textColor }} className="text-lg font-semibold">
                    {section.title}
                  </h3>
                  <div className="space-y-2">
                    {section.content.map((paragraph, j) => (
                      <p key={j} style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }} className="">
                        {paragraph.startsWith('- ') ? (
                          <span>• {paragraph.substring(2)}</span>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div style={{
              backgroundColor: theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(237, 233, 254, 1)'
            }} className="p-4 rounded-lg inline-flex items-center justify-center mb-4">
              <SparklesIcon className="h-8 w-8 text-purple-500" />
            </div>
            <h4 style={{ color: theme === 'dark' ? styles.textColor : styles.textColor }} className="text-base font-medium mb-2">
              Generate AI Summary Report
            </h4>
            <p style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }} className="text-sm max-w-md mx-auto">
              Click the button above to analyze your Excel file and receive an AI-powered summary report with key insights about your data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsSummary; 