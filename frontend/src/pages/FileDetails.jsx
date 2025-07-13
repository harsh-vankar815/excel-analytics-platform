import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFile, deleteFile } from '../redux/file/fileSlice';
import { getCharts } from '../redux/chart/chartSlice';
import Spinner from '../components/ui/Spinner';
import AIInsightsSummary from '../components/AIInsightsSummary';
import { useTheme } from '../contexts/ThemeContext';

const FileDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeSheet, setActiveSheet] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [fileCharts, setFileCharts] = useState([]);
  const [fileSummary, setFileSummary] = useState(null);
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();
  
  const { file, isLoading: fileLoading, fileSummary: reduxFileSummary } = useSelector(state => state.file);
  const { charts, isLoading: chartsLoading } = useSelector(state => state.chart);
  
  useEffect(() => {
    if (id) {
      dispatch(getFile(id));
      dispatch(getCharts());
    }
  }, [dispatch, id]);

  // Set file summary from Redux state if available
  useEffect(() => {
    if (reduxFileSummary) {
      setFileSummary(reduxFileSummary);
    }
  }, [reduxFileSummary]);

  // Filter charts for the current file
  useEffect(() => {
    if (charts.length > 0 && id) {
      const chartsForFile = charts.filter(chart => chart.excelFile === id);
      setFileCharts(chartsForFile);
    }
  }, [charts, id]);
  
  const handleDeleteFile = async () => {
    try {
      await dispatch(deleteFile(id)).unwrap();
      navigate('/app');
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  const handleSummaryGenerated = (summary) => {
    setFileSummary(summary);
  };
  
  const isLoading = fileLoading || chartsLoading;
  
  if (isLoading) {
    return <Spinner />;
  }
  
  if (!file) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <p className="text-lg text-gray-700 dark:text-gray-300">File not found or you don't have permission to view it.</p>
        <Link to="/app" className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          Return to Dashboard
        </Link>
      </div>
    );
  }
  
  const currentSheet = file.sheets[activeSheet];
  const headers = currentSheet?.data[0] || [];
  const data = currentSheet?.data.slice(1) || [];
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <div>
          <h1 style={{ color: theme === 'dark' ? styles.textColor : styles.textColor }} className="text-2xl font-bold mb-1">
            {file.originalName}
          </h1>
          <p style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }} className="text-sm">
            Uploaded on {new Date(file.createdAt).toLocaleString()} • {(file.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          <Link
            to={`/app/charts/create/${file._id}`}
            style={{
              backgroundColor: theme === 'dark' ? styles.successColor : '#059669',
              color: '#ffffff',
              transition: 'background-color 0.2s'
            }}
            className="px-4 py-2 rounded-lg hover:bg-green-700"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2dd4bf' : '#047857';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? styles.successColor : '#059669';
            }}
          >
            Create Chart
          </Link>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              backgroundColor: 'transparent',
              color: theme === 'dark' ? '#f87171' : '#dc2626',
              borderWidth: '1px', 
              borderColor: theme === 'dark' ? '#f87171' : '#dc2626',
              borderRadius: '0.375rem'
            }}
            className="px-4 py-2 font-medium"
          >
            Delete
          </button>
        </div>
      </div>
      
      {/* AI Insights Summary */}
      <div className="w-full overflow-hidden">
        <AIInsightsSummary 
          fileId={file._id}
          fileName={file.originalName}
          summaryText={fileSummary}
          onSummaryGenerated={handleSummaryGenerated}
          theme={theme}
          styles={styles}
        />
      </div>
      
      {/* Sheets Tabs */}
      {file.sheets.length > 1 && (
        <div style={{
          borderBottomWidth: '1px',
          borderColor: theme === 'dark' ? styles.borderColor : styles.borderColor,
        }} className="flex overflow-x-auto pb-1 -mx-2 px-2">
          {file.sheets.map((sheet, index) => (
            <button
              key={index}
              onClick={() => setActiveSheet(index)}
              style={{
                color: index === activeSheet 
                  ? (theme === 'dark' ? styles.primaryColor : styles.primaryColor)
                  : (theme === 'dark' ? styles.secondaryColor : styles.secondaryColor),
                borderBottomWidth: index === activeSheet ? '2px' : '0',
                borderColor: index === activeSheet 
                  ? (theme === 'dark' ? styles.primaryColor : styles.primaryColor)
                  : 'transparent'
              }}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Sheet Data */}
      <div style={{
        backgroundColor: theme === 'dark' ? styles.cardBackground : styles.cardBackground,
        color: theme === 'dark' ? styles.textColor : styles.textColor,
        boxShadow: `0 1px 3px ${styles.shadowColor}`
      }} className="rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full" style={{
              borderColor: theme === 'dark' ? styles.borderColor : styles.borderColor
            }}>
              <thead style={{
                backgroundColor: theme === 'dark' ? styles.tableHeaderBackground : styles.tableHeaderBackground
              }}>
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      scope="col"
                      style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }}
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                    >
                      {header || `Column ${index + 1}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ 
                backgroundColor: theme === 'dark' ? styles.cardBackground : styles.cardBackground 
              }}>
                {data.slice(0, 100).map((row, rowIndex) => (
                  <tr style={{ 
                    borderBottomWidth: '1px',
                    borderColor: theme === 'dark' ? styles.borderColor : styles.borderColor
                  }} key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }}
                        className="px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm"
                      >
                        {cell !== null && cell !== undefined ? cell.toString() : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {data.length > 100 && (
          <div style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }} className="p-4 text-center text-sm">
            Showing 100 of {data.length} rows
          </div>
        )}
      </div>
      
      {/* Associated Charts */}
      {fileCharts.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <h2 style={{ color: theme === 'dark' ? styles.textColor : styles.textColor }} className="text-xl font-semibold mb-3 sm:mb-4">
            Charts using this file
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {fileCharts.map(chart => (
              <div key={chart._id} style={{
                backgroundColor: theme === 'dark' ? styles.cardBackground : styles.cardBackground,
                borderWidth: '1px',
                borderColor: theme === 'dark' ? styles.borderColor : styles.borderColor
              }} className="rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div className="p-3 sm:p-4">
                  <h3 style={{ color: theme === 'dark' ? styles.textColor : styles.textColor }} className="text-base sm:text-lg font-medium mb-1">
                    {chart.title}
                  </h3>
                  <p style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }} className="text-xs sm:text-sm mb-2">
                    Type: {chart.type}
                  </p>
                  <div style={{
                    backgroundColor: theme === 'dark' ? styles.tableHeaderBackground : styles.tableRowHoverBackground
                  }} className="h-32 sm:h-40 rounded flex items-center justify-center">
                    <p style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }} className="text-xs sm:text-sm">
                      Chart Preview
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-4 flex justify-between items-center">
                    <span style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }} className="text-xs sm:text-sm">
                      {chart.viewCount} views
                    </span>
                    <Link 
                      to={`/app/charts/${chart._id}`} 
                      style={{
                        color: theme === 'dark' ? styles.primaryColor : styles.primaryColor,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = theme === 'dark' ? '#93c5fd' : '#2563eb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = theme === 'dark' ? styles.primaryColor : styles.primaryColor;
                      }}
                      className="text-xs sm:text-sm font-medium"
                    >
                      View Chart →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div style={{
            backgroundColor: theme === 'dark' ? styles.modalBackground : styles.modalBackground,
            color: theme === 'dark' ? styles.textColor : styles.textColor,
            position: 'relative',
            margin: 'auto',
            maxWidth: '28rem',
            width: '100%'
          }} className="rounded-lg p-4 sm:p-6">
            <h3 style={{ color: theme === 'dark' ? styles.textColor : styles.textColor }} className="text-lg font-medium mb-2 sm:mb-4">
              Confirm Delete
            </h3>
            <p style={{ color: theme === 'dark' ? styles.secondaryColor : styles.secondaryColor }} className="text-sm sm:text-base mb-4 sm:mb-6">
              Are you sure you want to delete "{file.originalName}"? This action cannot be undone and will also delete all associated charts.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setConfirmDelete(false)}
                style={{
                  backgroundColor: theme === 'dark' ? styles.buttonSecondaryBackground : styles.buttonSecondaryBackground,
                  color: theme === 'dark' ? styles.buttonSecondaryText : styles.buttonSecondaryText,
                  borderColor: theme === 'dark' ? styles.borderColor : styles.borderColor
                }}
                className="w-full sm:w-auto px-4 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteFile}
                style={{
                  backgroundColor: theme === 'dark' ? styles.dangerColor : '#dc2626',
                  color: '#ffffff'
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-md hover:bg-red-700"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? '#f87171' : '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? styles.dangerColor : '#dc2626';
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

export default FileDetails; 