import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
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
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Pie, PolarArea, Radar, Doughnut, Bubble, Scatter } from 'react-chartjs-2';
import { getFile } from '../redux/file/fileSlice';
import { createChart } from '../redux/chart/chartSlice';
import Card from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Interactive3DChart from '../components/charts/Interactive3DChart';
import { createChartPayload, validateChartData } from '../utils/chartUtils';
import {
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentArrowUpIcon,
  ChevronUpDownIcon,
  CubeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Spinner from '../components/ui/Spinner';
import { useTheme } from '../contexts/ThemeContext';
import Interactive2DChart from '../components/charts/Interactive2DChart';

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
  Title,
  Tooltip,
  Legend
);

// 2D Chart type options
const chartTypeOptions2D = [
  { id: 'bar', name: 'Bar Chart', icon: ChartBarIcon, description: 'Compare values across categories' },
  { id: 'line', name: 'Line Chart', icon: PresentationChartLineIcon, description: 'Show trends over a continuous interval' },
  { id: 'pie', name: 'Pie Chart', icon: DocumentChartBarIcon, description: 'Show proportions of a whole' },
  { id: 'doughnut', name: 'Doughnut', icon: DocumentChartBarIcon, description: 'Similar to pie chart with a center hole' },
  { id: 'polarArea', name: 'Polar Area', icon: DocumentChartBarIcon, description: 'Similar to pie but shows magnitude' },
  { id: 'radar', name: 'Radar', icon: DocumentChartBarIcon, description: 'Compare multiple variables' },
  { id: 'horizontalBar', name: 'Horizontal Bar', icon: ChartBarIcon, description: 'Bar chart with horizontal orientation' },
  { id: 'bubble', name: 'Bubble Chart', icon: DocumentChartBarIcon, description: 'Show data in 3 dimensions using bubble size' },
  { id: 'scatter', name: 'Scatter Plot', icon: DocumentChartBarIcon, description: 'Show correlation between variables' },
  { id: 'area', name: 'Area Chart', icon: PresentationChartLineIcon, description: 'Line chart with filled area below' },
  { id: 'stackedBar', name: 'Stacked Bar', icon: ChartBarIcon, description: 'Bar chart with stacked categories' },
  { id: 'mixed', name: 'Mixed Chart', icon: PresentationChartLineIcon, description: 'Combine different chart types' }
];

// 3D Chart type options
const chartTypeOptions3D = [
  { id: 'column', name: '3D Column', icon: CubeIcon, description: 'Compare values with 3D columns' },
  { id: 'scatter', name: '3D Scatter', icon: CubeIcon, description: 'Plot points in 3D space' },
  { id: 'bar', name: '3D Bar', icon: CubeIcon, description: 'Horizontal 3D bars' },
  { id: 'surface', name: '3D Surface', icon: CubeIcon, description: 'Create a 3D surface plot' },
  { id: 'line', name: '3D Line', icon: CubeIcon, description: 'Plot 3D lines' },
  { id: 'bubble', name: '3D Bubble', icon: CubeIcon, description: '3D scatter with varied bubble sizes' },
  { id: 'heatmap', name: '3D Heat Map', icon: CubeIcon, description: 'Show density with 3D heat mapping' },
  { id: 'waterfall', name: '3D Waterfall', icon: CubeIcon, description: 'Show cumulative effect with 3D' }
];

// Helper functions
const analyzeColumnDataType = (column, data) => {
  if (!data || data.length === 0) return 'unknown';

  // Get non-null values for the column
  const values = data
    .map(row => row[column])
    .filter(value => value !== null && value !== undefined);

  if (values.length === 0) return 'unknown';

  // Check if all values are dates
  const isAllDates = values.every(value => {
    if (value instanceof Date) return true;
    if (typeof value === 'string') {
      const date = new Date(value);
      return date instanceof Date && !isNaN(date);
    }
    return false;
  });

  if (isAllDates) return 'date';

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

const formatDataValue = (value, isNumeric = true) => {
  if (value === null || value === undefined) {
    return isNumeric ? 0 : '';
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === 'string') {
    // Try to parse as date
    const date = new Date(value);
    if (date instanceof Date && !isNaN(date)) {
      return date.toLocaleDateString();
    }

    // Try to parse as number if numeric is expected
    if (isNumeric) {
      const num = parseFloat(value);
      if (!isNaN(num)) {
        return num;
      }
    }
  }

  return value;
};

const ChartCreation = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, getThemeStyles } = useTheme();
  const styles = getThemeStyles();

  const { file: currentFile, isLoading: fileLoading, error: fileError } = useSelector((state) => state.file);
  const { loading: chartLoading } = useSelector((state) => state.chart);

  const [chartType, setChartType] = useState('bar');
  const [chartDimension, setChartDimension] = useState('2d'); // '2d' or '3d'
  const [chartTitle, setChartTitle] = useState('');
  const [selectedColumns, setSelectedColumns] = useState({
    x: '',
    y: [],
    z: '' // Only used for 3D charts
  });
  const [previewData, setPreviewData] = useState(null);
  const [availableColumns, setAvailableColumns] = useState([]);
  const [processedFileData, setProcessedFileData] = useState(null);
  const [showDataInspector, setShowDataInspector] = useState(false);
  const [chartOptions, setChartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          color: theme === 'dark' ? 'rgb(156, 163, 175)' : 'rgb(75, 85, 99)',
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        titleColor: theme === 'dark' ? 'rgb(229, 231, 235)' : 'rgb(17, 24, 39)',
        bodyColor: theme === 'dark' ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)',
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1
      },
      title: {
        display: true,
        color: 'rgb(156, 163, 175)',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12
          }
        },
        border: {
          color: 'rgb(75, 85, 99)'
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 12
          }
        },
        border: {
          color: 'rgb(75, 85, 99)'
        }
      }
    }
  });

  // Fetch file data when component loads
  useEffect(() => {
    if (fileId) {
      dispatch(getFile(fileId));
    }
  }, [dispatch, fileId]);

  // Debug the file data when it changes
  useEffect(() => {
    if (currentFile) {
      console.log("Received file data from Redux:", currentFile);
      console.log("File data type:", typeof currentFile);

      // Check for common properties
      if (currentFile.data) {
        console.log("File has 'data' property of type:", typeof currentFile.data);
        console.log("First few items:", Array.isArray(currentFile.data) ? currentFile.data.slice(0, 3) : currentFile.data);
      }

      if (currentFile.sheets) {
        console.log("File has 'sheets' property of type:", typeof currentFile.sheets);
        console.log("Sheet count:", Array.isArray(currentFile.sheets) ? currentFile.sheets.length : "not an array");
      }

      if (currentFile.content) {
        console.log("File has 'content' property of type:", typeof currentFile.content);
      }
    }
  }, [currentFile]);

  // Function to normalize the Excel data structure
  const normalizeExcelData = (fileData) => {
    console.log("Normalizing Excel data structure");

    // Try to determine the data structure
    if (!fileData) {
      console.error("No fileData provided");
      return { success: false };
    }

    // Debug the raw file data structure
    console.log("Raw file data structure:", {
      hasData: Boolean(fileData.data),
      hasSheets: Boolean(fileData.sheets),
      hasContent: Boolean(fileData.content),
      topLevelKeys: Object.keys(fileData)
    });

    // Excel data can come in different formats, handle each case
    let processedData = [];
    let columnNames = [];

    try {
      // Case 1: Data in sheets array
      if (fileData.sheets && Array.isArray(fileData.sheets) && fileData.sheets.length > 0) {
        console.log("Data format: sheets array");
        const sheetData = fileData.sheets[0].data;

        if (Array.isArray(sheetData) && sheetData.length > 0) {
          const firstRow = sheetData[0];

          // Check if the first row is an array (Excel-like format)
          if (Array.isArray(firstRow)) {
            columnNames = firstRow.map(col => String(col || '').trim());
            processedData = sheetData.slice(1).map(row => {
              const obj = {};
              columnNames.forEach((colName, idx) => {
                obj[colName] = row[idx];
              });
              return obj;
            });
          }
          // Check if the first row is an object (JSON-like format)
          else if (typeof firstRow === 'object' && firstRow !== null) {
            columnNames = Object.keys(firstRow);
            processedData = sheetData;
          }
        }
      }
      // Case 2: Data directly in "data" property
      else if (fileData.data && Array.isArray(fileData.data) && fileData.data.length > 0) {
        console.log("Data format: direct data array");
        const directData = fileData.data;
        const firstRow = directData[0];

        if (Array.isArray(firstRow)) {
          columnNames = firstRow.map(col => String(col || '').trim());
          processedData = directData.slice(1).map(row => {
            const obj = {};
            columnNames.forEach((colName, idx) => {
              obj[colName] = row[idx];
            });
            return obj;
          });
        } else if (typeof firstRow === 'object' && firstRow !== null) {
          columnNames = Object.keys(firstRow);
          processedData = directData;
        }
      }
      // Case 3: Single sheet property
      else if (fileData.sheet && fileData.sheet.data && Array.isArray(fileData.sheet.data)) {
        console.log("Data format: single sheet property");
        const sheetData = fileData.sheet.data;
        const firstRow = sheetData[0];

        if (Array.isArray(firstRow)) {
          columnNames = firstRow.map(col => String(col || '').trim());
          processedData = sheetData.slice(1).map(row => {
            const obj = {};
            columnNames.forEach((colName, idx) => {
              obj[colName] = row[idx];
            });
            return obj;
          });
        } else if (typeof firstRow === 'object' && firstRow !== null) {
          columnNames = Object.keys(firstRow);
          processedData = sheetData;
        }
      }
      // Case 4: Content property with data inside
      else if (fileData.content) {
        console.log("Data format: content property");
        let contentData = fileData.content;

        // If content is a string, try to parse it as JSON
        if (typeof contentData === 'string') {
          try {
            contentData = JSON.parse(contentData);
            console.log("Parsed content data from string");
          } catch (error) {
            console.error("Failed to parse content data string:", error);
          }
        }

        // Now try to extract data from the parsed content
        if (contentData.data && Array.isArray(contentData.data)) {
          const dataArray = contentData.data;
          if (dataArray.length > 0) {
            const firstRow = dataArray[0];
            if (Array.isArray(firstRow)) {
              columnNames = firstRow.map(col => String(col || '').trim());
              processedData = dataArray.slice(1).map(row => {
                const obj = {};
                columnNames.forEach((colName, idx) => {
                  obj[colName] = row[idx];
                });
                return obj;
              });
            } else if (typeof firstRow === 'object' && firstRow !== null) {
              columnNames = Object.keys(firstRow);
              processedData = dataArray;
            }
          }
        } else if (contentData.sheets && Array.isArray(contentData.sheets) && contentData.sheets.length > 0) {
          const sheetData = contentData.sheets[0].data;
          if (Array.isArray(sheetData) && sheetData.length > 0) {
            const firstRow = sheetData[0];
            if (Array.isArray(firstRow)) {
              columnNames = firstRow.map(col => String(col || '').trim());
              processedData = sheetData.slice(1).map(row => {
                const obj = {};
                columnNames.forEach((colName, idx) => {
                  obj[colName] = row[idx];
                });
                return obj;
              });
            } else if (typeof firstRow === 'object' && firstRow !== null) {
              columnNames = Object.keys(firstRow);
              processedData = sheetData;
            }
          }
        }
      }
      // Case 5: Directly use fileData if it's an array
      else if (Array.isArray(fileData) && fileData.length > 0) {
        console.log("Data format: fileData is directly an array");
        const firstRow = fileData[0];

        if (Array.isArray(firstRow)) {
          columnNames = firstRow.map(col => String(col || '').trim());
          processedData = fileData.slice(1).map(row => {
            const obj = {};
            columnNames.forEach((colName, idx) => {
              obj[colName] = row[idx];
            });
            return obj;
          });
        } else if (typeof firstRow === 'object' && firstRow !== null) {
          columnNames = Object.keys(firstRow);
          processedData = fileData;
        }
      }
      // Case 6: excelData property
      else if (fileData.excelData) {
        console.log("Data format: excelData property");
        let excelData = fileData.excelData;

        // Handle different structures within excelData
        if (Array.isArray(excelData) && excelData.length > 0) {
          const firstRow = excelData[0];
          if (Array.isArray(firstRow)) {
            columnNames = firstRow.map(col => String(col || '').trim());
            processedData = excelData.slice(1).map(row => {
              const obj = {};
              columnNames.forEach((colName, idx) => {
                obj[colName] = row[idx];
              });
              return obj;
            });
          } else if (typeof firstRow === 'object' && firstRow !== null) {
            columnNames = Object.keys(firstRow);
            processedData = excelData;
          }
        } else if (excelData.data && Array.isArray(excelData.data)) {
          const dataArray = excelData.data;
          if (dataArray.length > 0) {
            const firstRow = dataArray[0];
            if (Array.isArray(firstRow)) {
              columnNames = firstRow.map(col => String(col || '').trim());
              processedData = dataArray.slice(1).map(row => {
                const obj = {};
                columnNames.forEach((colName, idx) => {
                  obj[colName] = row[idx];
                });
                return obj;
              });
            } else if (typeof firstRow === 'object' && firstRow !== null) {
              columnNames = Object.keys(firstRow);
              processedData = dataArray;
            }
          }
        } else if (excelData.sheets && Array.isArray(excelData.sheets) && excelData.sheets.length > 0) {
          const sheetData = excelData.sheets[0].data;
          if (Array.isArray(sheetData) && sheetData.length > 0) {
            const firstRow = sheetData[0];
            if (Array.isArray(firstRow)) {
              columnNames = firstRow.map(col => String(col || '').trim());
              processedData = sheetData.slice(1).map(row => {
                const obj = {};
                columnNames.forEach((colName, idx) => {
                  obj[colName] = row[idx];
                });
                return obj;
              });
            } else if (typeof firstRow === 'object' && firstRow !== null) {
              columnNames = Object.keys(firstRow);
              processedData = sheetData;
            }
          }
        }
      }
      // Case 7: Fallback - look for array data in any property
      else {
        console.log("Data format: using fallback to find array data in any property");
        // Check all properties for array data
        const potentialDataProperties = Object.keys(fileData).filter(key => {
          const value = fileData[key];
          return Array.isArray(value) && value.length > 0;
        });

        console.log("Potential data properties found:", potentialDataProperties);

        // Try each property that contains an array
        for (const prop of potentialDataProperties) {
          const dataArray = fileData[prop];

          if (dataArray.length > 0) {
            const firstRow = dataArray[0];

            // If the first row is an array, assume it's column headers
            if (Array.isArray(firstRow)) {
              columnNames = firstRow.map(col => String(col || '').trim());
              processedData = dataArray.slice(1).map(row => {
                const obj = {};
                columnNames.forEach((colName, idx) => {
                  obj[colName] = row[idx];
                });
                return obj;
              });
              console.log(`Found usable data in property: ${prop}`);
              break;
            }
            // If the first row is an object, use its keys as column names
            else if (typeof firstRow === 'object' && firstRow !== null) {
              columnNames = Object.keys(firstRow);
              processedData = dataArray;
              console.log(`Found usable data in property: ${prop}`);
              break;
            }
          }
        }

        // If no array data found, look for nested objects that might contain array data
        if (processedData.length === 0) {
          console.log("No direct array data found, looking for nested objects");

          const searchNestedArrays = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return;

            Object.keys(obj).forEach(key => {
              const value = obj[key];
              const currentPath = path ? `${path}.${key}` : key;

              if (Array.isArray(value) && value.length > 0) {
                console.log(`Found array in nested property: ${currentPath}`);

                const firstRow = value[0];
                if (Array.isArray(firstRow)) {
                  columnNames = firstRow.map(col => String(col || '').trim());
                  processedData = value.slice(1).map(row => {
                    const obj = {};
                    columnNames.forEach((colName, idx) => {
                      obj[colName] = row[idx];
                    });
                    return obj;
                  });
                  return;
                } else if (typeof firstRow === 'object' && firstRow !== null) {
                  columnNames = Object.keys(firstRow);
                  processedData = value;
                  return;
                }
              } else if (typeof value === 'object' && value !== null) {
                searchNestedArrays(value, currentPath);
              }
            });
          };

          searchNestedArrays(fileData);
        }
      }

      // Check if we have valid data
      if (processedData.length === 0 || columnNames.length === 0) {
        console.error("Failed to extract valid data from Excel file");
        return { success: false };
      }

      console.log(`Successfully normalized data: ${processedData.length} rows, ${columnNames.length} columns`);
      return {
        success: true,
        data: processedData,
        columns: columnNames
      };
    } catch (error) {
      console.error("Error normalizing Excel data:", error);
      return { success: false };
    }
  };

  // Update available columns when file data is loaded
  useEffect(() => {
    if (currentFile) {
      try {
        console.log("Raw file data received:", currentFile);

        // Normalize the Excel data structure
        const normalizedData = normalizeExcelData(currentFile);

        if (!normalizedData.success) {
          console.error("Failed to normalize Excel data");
          return;
        }

        const { data: processedData, columns: columnNames } = normalizedData;

        console.log("Processed data (first 2 rows):", processedData.slice(0, 2));
        console.log("Column names:", columnNames);

        // Transform columns into the format expected by ChartAxisSelector
        const formattedColumns = columnNames.map(columnName => {
          // Find the first non-null, non-empty value in the column to use as a sample
          let sampleValue = null;
          for (let i = 0; i < Math.min(10, processedData.length); i++) {
            const value = processedData[i][columnName];
            if (value !== null && value !== undefined && value !== '') {
              sampleValue = value;
              break;
            }
          }

          return {
            name: columnName,
            sample: sampleValue
          };
        });

        console.log("Formatted columns for axis selection:", formattedColumns);
        setAvailableColumns(formattedColumns);

        // Update the component state with the processed data
        setProcessedFileData(processedData);

        // Analyze column types for default selections
        if (columnNames.length > 0) {
          const columnTypes = {};
          columnNames.forEach(col => {
            columnTypes[col] = analyzeColumnDataType(col, processedData);
          });

          const numericColumns = columnNames.filter(col =>
            columnTypes[col] === 'numeric'
          );
          console.log("Numeric columns found:", numericColumns);

          const categoricalColumns = columnNames.filter(col =>
            columnTypes[col] === 'categorical' ||
            columnTypes[col] === 'date'
          );
          console.log("Categorical columns found:", categoricalColumns);

          // Set default selections based on column types
          setSelectedColumns({
            x: categoricalColumns.length > 0 ? categoricalColumns[0] : columnNames[0],
            y: numericColumns.length > 0 ? [numericColumns[0]] :
              columnNames.length > 1 ? [columnNames[1]] : [],
          });
        }
      } catch (error) {
        console.error("Error processing Excel data:", error);
      }
    }
  }, [currentFile]);

  // Generate chart preview data
  useEffect(() => {
    if (
      processedFileData &&
      processedFileData.length > 0 &&
      selectedColumns.x &&
      selectedColumns.y.length > 0
    ) {
      console.log("Generating chart preview with:", {
        x: selectedColumns.x,
        y: selectedColumns.y,
        chartType,
        dataAvailable: processedFileData.length
      });

      try {
        const dataSource = processedFileData;

        // Check if the selected columns actually exist in the data
        const sampleRow = dataSource[0];
        const missingColumns = [];

        if (!sampleRow.hasOwnProperty(selectedColumns.x)) {
          console.error(`X-axis column "${selectedColumns.x}" not found in data`);
          missingColumns.push(`X-axis: ${selectedColumns.x}`);
        }

        selectedColumns.y.forEach(column => {
          if (!sampleRow.hasOwnProperty(column)) {
            console.error(`Y-axis column "${column}" not found in data`);
            missingColumns.push(`Y-axis: ${column}`);
          }
        });

        if (missingColumns.length > 0) {
          setPreviewData({
            error: true,
            missingColumns,
            message: "Selected columns not found in data"
          });
          return;
        }

        // Format chart labels (X-axis)
        const xColumnType = analyzeColumnDataType(selectedColumns.x, dataSource);
        const isXAxisNumeric = xColumnType === 'numeric';
        const isXAxisDate = xColumnType === 'date';

        console.log(`X-axis column type: ${xColumnType}`);

        const labels = dataSource.map((row) => {
          const rawValue = row[selectedColumns.x];
          return formatDataValue(rawValue, false);
        });

        console.log("Chart labels (first 5):", labels.slice(0, 5));

        const datasets = selectedColumns.y.map((column, index) => {
          const generateColors = () => {
            const baseColors = [
              '#60A5FA', // Brighter blue
              '#34D399', // Brighter green
              '#F97316', // Orange
              '#A78BFA', // Brighter purple
              '#EC4899', // Pink
              '#06B6D4', // Cyan
            ];

            const color = baseColors[index % baseColors.length];
            return {
              solid: color,
              translucent: `${color}80` // 50% opacity
            };
          };

          const colors = generateColors();

          // Determine if this column has string values
          const columnType = analyzeColumnDataType(column, dataSource);
          const isNumeric = columnType === 'numeric';

          // Extract data with proper type handling
          const columnData = dataSource.map(row => {
            const rawValue = row[column];

            // For categorical charts or non-numeric data, preserve strings
            if (!isNumeric || chartType === 'pie' || chartType === 'doughnut' ||
              chartType === 'polarArea' || chartType === 'radar') {
              return rawValue !== null && rawValue !== undefined ? String(rawValue) : '';
            }

            // For numeric data in numeric charts, convert to number
            return formatDataValue(rawValue, true);
          });

          const commonDataset = {
            label: column,
            data: columnData,
            borderColor: colors.solid,
            backgroundColor: colors.translucent,
            borderWidth: 2,
          };

          // Add specific styling based on chart type
          if (chartType === 'line') {
            return {
              ...commonDataset,
              pointBackgroundColor: colors.solid,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.3,
              fill: index === 0,
            };
          } else if (chartType === 'pie' || chartType === 'doughnut') {
            return {
              ...commonDataset,
              backgroundColor: [
                '#60A5FA', // Brighter blue
                '#34D399', // Brighter green
                '#F97316', // Orange
                '#A78BFA', // Brighter purple
                '#EC4899', // Pink
                '#06B6D4', // Cyan
              ],
              borderWidth: 1,
              borderColor: '#1F2937', // Dark background color
            };
          }

          return commonDataset;
        });

        console.log("Generated datasets:", datasets);

        setPreviewData({
          labels,
          datasets,
        });

        // Update chart options with current theme colors
        setChartOptions(prev => ({
          ...prev,
          plugins: {
            ...prev.plugins,
            title: {
              ...prev.plugins.title,
              text: chartTitle,
              color: 'rgb(156, 163, 175)', // Light gray that works in both themes
            }
          }
        }));

      } catch (error) {
        console.error("Error generating chart preview:", error);
        setPreviewData({
          error: true,
          message: error.message
        });
      }
    }
  }, [processedFileData, selectedColumns, chartType, chartTitle]);

  const handleXColumnChange = (e) => {
    console.log("X-axis selection changed to:", e.target.value);
    setSelectedColumns({
      ...selectedColumns,
      x: e.target.value
    });
  };

  const handleYColumnChange = (column) => {
    console.log("Y-axis selection toggled:", column);
    const updatedYColumns = selectedColumns.y.includes(column)
      ? selectedColumns.y.filter(col => col !== column)
      : [...selectedColumns.y, column];

    console.log("Updated Y-axis columns:", updatedYColumns);
    setSelectedColumns({
      ...selectedColumns,
      y: updatedYColumns
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation with detailed error messages
    if (!chartTitle.trim()) {
      toast.error('Please enter a chart title');
      return;
    }

    if (!selectedColumns.x || selectedColumns.y.length === 0) {
      toast.error('Please select both X and Y columns');
      return;
    }

    if (!processedFileData || processedFileData.length === 0) {
      toast.error('No data available to create chart');
      return;
    }

    // Check for empty column selections
    if (selectedColumns.y.includes('')) {
      toast.error('Please remove empty column selections');
      return;
    }

    // Validate data using our utility function
    if (!validateChartData(selectedColumns, processedFileData)) {
      toast.error('Invalid data selected for chart creation');
      return;
    }

    try {
      // Create a proper chart payload using our utility function
      const chartPayload = createChartPayload({
        title: chartTitle,
        fileId,
        chartType,
        chartDimension,
        selectedColumns,
        processedFileData,
        sheetName: currentFile?.sheets?.[0]?.name || 'Sheet1'
      });

      // Log the final payload for debugging
      console.log('Creating chart with payload:', chartPayload);

      // Dispatch the create chart action
      const result = await dispatch(createChart(chartPayload)).unwrap();

      if (!result || !result._id) {
        throw new Error('Invalid response from server');
      }

      toast.success('Chart created successfully!');

      // Navigate to the new chart
      setTimeout(() => {
        navigate(`/app/charts/${result._id}`);
      }, 500);
    } catch (error) {
      console.error('Failed to create chart:', error);

      // Extract the most relevant error message
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Failed to create chart. Please try again.';

      toast.error(errorMessage);
    }
  };

  // Chart preview section
  const renderChartPreview = () => {
    if (!processedFileData) {
      return (
        <div className="flex h-80 items-center justify-center">
          <div className="text-center p-6">
            <ChevronUpDownIcon className="h-12 w-12 mx-auto mb-4" style={{ color: theme === 'dark' ? '#9ca3af' : '#9ca3af' }} />
            <p style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280' }}>
              No Excel data available. Please make sure the file was loaded correctly.
              <br />
              <span className="text-xs mt-3 block">
                Try selecting different columns for your chart.
              </span>
            </p>
          </div>
        </div>
      );
    }

    if (!selectedColumns.x || selectedColumns.y.length === 0) {
      return (
        <div className="flex h-80 items-center justify-center">
          <div className="text-center p-6">
            <ChevronUpDownIcon className="h-12 w-12 mx-auto mb-4" style={{ color: theme === 'dark' ? '#9ca3af' : '#9ca3af' }} />
            <p style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280' }}>
              Please select both X and Y axis columns to preview your chart.
              <br />
              <span className="text-xs mt-2 block">
                X-axis: {availableColumns.length} columns available
                <br />
                Make sure your Excel data has headers and values.
              </span>
            </p>
          </div>
        </div>
      );
    }

    // Main try-catch wrapper for the entire chart rendering process
    try {
      // Validate 3D charts need Z-axis for scatter plots
      if (chartDimension === '3d' && chartType === 'scatter' && !selectedColumns.z) {
        return (
          <div className="flex h-80 items-center justify-center">
            <div className="text-center p-6">
              <CubeIcon className="h-12 w-12 mx-auto mb-4" style={{ color: theme === 'dark' ? '#f59e0b' : '#f59e0b' }} />
              <p style={{ color: theme === 'dark' ? '#fcd34d' : '#92400e', fontWeight: 500 }}>
                3D scatter plots require a Z-axis column.
                <br />
                <span className="text-xs mt-2 block" style={{ fontWeight: 400 }}>Please select a numeric column for the Z-axis.</span>
              </p>
            </div>
          </div>
        );
      }

      // For 3D charts, render the Interactive3DChart component
      if (chartDimension === '3d') {
        if (!processedFileData) {
          return (
            <div className="flex h-80 items-center justify-center">
              <div className="text-center p-6">
                <ArrowPathIcon className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400">
                  Processing data for 3D visualization...
                </p>
              </div>
            </div>
          );
        }

        try {
          // Verify data is suitable for 3D visualization
          const xColumnType = analyzeColumnDataType(selectedColumns.x, processedFileData);
          const yColumnTypes = selectedColumns.y.map(col => analyzeColumnDataType(col, processedFileData));

          if (yColumnTypes.some(type => type !== 'numeric')) {
            return (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: theme === 'dark' ? '#f59e0b' : '#f59e0b' }} />
                  <p style={{ color: theme === 'dark' ? '#fcd34d' : '#92400e', fontWeight: 500 }}>
                    3D charts require numeric Y-axis data
                    <br />
                    <span className="text-xs mt-2 block" style={{ fontWeight: 400 }}>Please select numeric columns for the Y-axis</span>
                  </p>
                </div>
              </div>
            );
          }

          if (chartType === 'scatter' && (!selectedColumns.z || analyzeColumnDataType(selectedColumns.z, processedFileData) !== 'numeric')) {
            return (
              <div className="flex h-80 items-center justify-center">
                <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: theme === 'dark' ? '#f59e0b' : '#f59e0b' }} />
                  <p style={{ color: theme === 'dark' ? '#fcd34d' : '#92400e', fontWeight: 500 }}>
                    3D scatter plots require a numeric Z-axis column
                    <br />
                    <span className="text-xs mt-2 block" style={{ fontWeight: 400 }}>Please select a numeric column for the Z-axis</span>
                  </p>
                </div>
              </div>
            );
          }

          // For 3D charts
          return (
            <div className="h-[60vh] w-full" style={{ minHeight: "400px" }}>
              <Interactive3DChart
                key={`3d-${chartType}-${selectedColumns.x}-${selectedColumns.y.join('-')}-${selectedColumns.z || ''}`}
                data={processedFileData}
                selectedColumns={selectedColumns}
                chartType={chartType}
                chartTitle={chartTitle}
                config={{
                  showGrid: true,
                  animate: true,
                  maxHeight: 5,
                  barWidth: 0.5,
                  spacing: 0.2,
                }}
              />
            </div>
          );
        } catch (error) {
          console.error("Error rendering 3D chart:", error);
          return (
            <div className="flex h-80 items-center justify-center">
              <div className="text-center p-6 rounded-lg" style={{ backgroundColor: theme === 'dark' ? 'rgba(127, 29, 29, 0.2)' : '#fef2f2' }}>
                <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: theme === 'dark' ? '#ef4444' : '#ef4444' }} />
                <p style={{ color: theme === 'dark' ? '#f87171' : '#b91c1c', fontWeight: 500 }}>
                  Error rendering 3D chart. Please try different columns or chart type.
                  <br />
                  <span className="text-xs mt-2 block" style={{ fontWeight: 400 }}>{error.message}</span>
                </p>
                <button
                  onClick={() => setChartDimension('2d')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                >
                  Switch to 2D Chart
                </button>
              </div>
            </div>
          );
        }
      }

      // For 2D charts
      try {
        // For all chart types, use Interactive2DChart which now properly handles string axes
        return (
          <div className="h-[60vh] w-full" style={{ minHeight: "400px" }}>
            <Interactive2DChart
              key={`2d-${chartType}-${selectedColumns.x}-${selectedColumns.y.join('-')}`}
              data={processedFileData}
              selectedColumns={selectedColumns}
              chartType={chartType}
              chartTitle={chartTitle}
            />
          </div>
        );
      } catch (error) {
        console.error("Error rendering 2D chart:", error);
        return (
          <div className="flex h-80 items-center justify-center">
            <div className="text-center p-6 rounded-lg" style={{ backgroundColor: theme === 'dark' ? 'rgba(127, 29, 29, 0.2)' : '#fef2f2' }}>
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: theme === 'dark' ? '#ef4444' : '#ef4444' }} />
              <p style={{ color: theme === 'dark' ? '#f87171' : '#b91c1c', fontWeight: 500 }}>
                Error rendering chart. Please try different columns or chart type.
                <br />
                <span className="text-xs mt-2 block" style={{ fontWeight: 400 }}>{error.message}</span>
              </p>
            </div>
          </div>
        );
      }
    } catch (error) {
      console.error("Error in chart preview rendering:", error);
      return (
        <div className="flex h-80 items-center justify-center">
          <div className="text-center p-6 rounded-lg" style={{ backgroundColor: theme === 'dark' ? 'rgba(127, 29, 29, 0.2)' : '#fef2f2' }}>
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" style={{ color: theme === 'dark' ? '#ef4444' : '#ef4444' }} />
            <p style={{ color: theme === 'dark' ? '#f87171' : '#b91c1c', fontWeight: 500 }}>
              An unexpected error occurred while preparing the chart.
              <br />
              <span className="text-xs mt-2 block" style={{ fontWeight: 400 }}>{error.message}</span>
            </p>
          </div>
        </div>
      );
    }
  };

  const inspectExcelData = () => {
    if (!currentFile) {
      toast.error("No file data available");
      return;
    }

    console.log("Inspecting Excel file data:", currentFile);
    setShowDataInspector(true);
  };

  // Extract raw data for direct inspection
  const extractRawData = () => {
    if (!currentFile) return [];

    // Try to find any array data in the file
    const findArrayData = (obj) => {
      if (!obj) return null;

      // If it's already an array with data, return it
      if (Array.isArray(obj) && obj.length > 0) {
        return obj.slice(0, 10); // Return first 10 rows
      }

      // Check all properties for array data
      for (const key in obj) {
        const value = obj[key];

        // Direct array property
        if (Array.isArray(value) && value.length > 0) {
          return value.slice(0, 10);
        }

        // Nested object that might contain arrays
        if (typeof value === 'object' && value !== null) {
          const result = findArrayData(value);
          if (result) return result;
        }
      }

      return null;
    };

    const rawData = findArrayData(currentFile);
    console.log("Extracted raw data:", rawData);
    return rawData || [];
  };

  // Render Raw Data Table
  const renderRawDataTable = () => {
    const rawData = extractRawData();

    if (!rawData || rawData.length === 0) {
      return (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-amber-800 text-sm">No raw data found in the file</p>
        </div>
      );
    }

    // Handle different row formats
    const sampleRow = rawData[0];
    const isRowArray = Array.isArray(sampleRow);
    const isRowObject = typeof sampleRow === 'object' && sampleRow !== null && !Array.isArray(sampleRow);

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-700 text-xs">
          <thead>
            <tr>
              <th className="px-2 py-1 bg-gray-100 dark:bg-gray-700">#</th>
              {isRowArray ? (
                // If rows are arrays, use numeric indices as headers
                [...Array(sampleRow.length)].map((_, idx) => (
                  <th key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700">
                    Column {idx}
                  </th>
                ))
              ) : isRowObject ? (
                // If rows are objects, use keys as headers
                Object.keys(sampleRow).map((key, idx) => (
                  <th key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700">
                    {key}
                  </th>
                ))
              ) : (
                <th className="px-2 py-1 bg-gray-100 dark:bg-gray-700">Value</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rawData.map((row, rowIdx) => (
              <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                <td className="px-2 py-1 border-r">{rowIdx}</td>
                {isRowArray ? (
                  // Row is an array, render each cell
                  row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-2 py-1 border-r">
                      {typeof cell === 'object' ? JSON.stringify(cell) : String(cell || '')}
                    </td>
                  ))
                ) : isRowObject ? (
                  // Row is an object, render each value
                  Object.keys(sampleRow).map((key, cellIdx) => (
                    <td key={cellIdx} className="px-2 py-1 border-r">
                      {typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] || '')}
                    </td>
                  ))
                ) : (
                  // Row is a primitive
                  <td className="px-2 py-1 border-r">{String(row || '')}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 text-xs text-gray-500">
          <p>
            Showing raw Excel data from the file. Use these column names to create your chart.
          </p>
        </div>
      </div>
    );
  };

  // Try to create structured data directly from raw Excel data
  const createStructuredDataFromRaw = () => {
    const rawData = extractRawData();

    if (!rawData || rawData.length === 0) {
      toast.error("No raw data found in the Excel file");
      return false;
    }

    try {
      console.log("Creating structured data from raw Excel data");

      // Check the format of the first row
      const firstRow = rawData[0];
      const isRowArray = Array.isArray(firstRow);
      const isRowObject = typeof firstRow === 'object' && firstRow !== null && !Array.isArray(firstRow);

      let structuredData = [];
      let headers = [];

      if (isRowArray) {
        // Assume first row contains headers
        headers = rawData[0].map((item, idx) =>
          item ? String(item).trim() : `Column ${idx}`
        );

        // Create structured data with header keys
        structuredData = rawData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, idx) => {
            obj[header] = row[idx];
          });
          return obj;
        });
      } else if (isRowObject) {
        // Already structured as objects
        headers = Object.keys(firstRow);
        structuredData = rawData;
      }

      if (structuredData.length === 0 || headers.length === 0) {
        toast.error("Could not create structured data from the Excel file");
        return false;
      }

      console.log("Successfully created structured data:", {
        rowCount: structuredData.length,
        columns: headers,
        sample: structuredData.slice(0, 2)
      });

      // Update state with the structured data
      setProcessedFileData(structuredData);

      // Update available columns
      const formattedColumns = headers.map(columnName => {
        // Find sample value
        let sampleValue = null;
        if (structuredData.length > 0) {
          sampleValue = structuredData[0][columnName];
        }

        return {
          name: columnName,
          sample: sampleValue
        };
      });

      setAvailableColumns(formattedColumns);

      // Set default selections
      if (headers.length > 0) {
        setSelectedColumns({
          x: headers[0], // First column for X-axis
          y: headers.length > 1 ? [headers[1]] : [] // Second column for Y-axis if available
        });
      }

      return true;
    } catch (error) {
      console.error("Error creating structured data:", error);
      toast.error("Failed to process Excel data structure");
      return false;
    }
  };

  if (fileLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Spinner
          size="lg"
          variant="bars"
          color="primary"
          text="Loading file data..."
        />
      </div>
    );
  }

  if (fileError) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg max-w-lg text-center">
          <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Error Loading File</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{fileError}</p>
          <Button
            onClick={() => navigate('/app')}
            variant="primary"
            size="lg"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-6"
      style={{ backgroundColor: theme === 'dark' ? styles.bgColor : '#f9fafb' }}
    >
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{
              color: theme === 'dark' ? styles.textColor : '#1f2937'
            }}
          >
            Create New Chart
          </h1>
          <p style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280' }}>
            From file: <span className="font-medium">{currentFile?.filename}</span>
          </p>
        </div>
        <Button
          onClick={() => navigate(`/app/files/${fileId}`)}
          variant="outline"
          icon={ArrowPathIcon}
          style={{
            color: theme === 'dark' ? styles.textColor : '#1f2937',
            borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
            backgroundColor: theme === 'dark' ? styles.cardBgColor : '#ffffff'
          }}
        >
          Back to File
        </Button>
      </div>

      <div className="mb-6">
        <Card
          variant="glassmorphic"
          title="Chart Dimensions"
          subtitle="Choose between 2D and 3D visualizations"
          icon={CubeIcon}
          style={{
            backgroundColor: theme === 'dark' ? styles.cardBgColor : '#ffffff',
            borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
            color: theme === 'dark' ? styles.textColor : '#1f2937'
          }}
          titleStyle={{
            color: theme === 'dark' ? styles.textColor : '#1f2937',
            fontWeight: '600'
          }}
          subtitleStyle={{
            color: theme === 'dark' ? styles.secondaryColor : '#6b7280'
          }}
        >
          <div className="p-4">
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setChartDimension('2d');
                  // Set default 2D chart type if currently on 3D
                  if (chartType === 'column' || chartType === 'scatter') {
                    setChartType('bar');
                  }
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all flex-1`}
                style={{
                  borderColor: chartDimension === '2d'
                    ? theme === 'dark' ? styles.primaryColor : '#3b82f6'
                    : theme === 'dark' ? styles.borderColor : '#e5e7eb',
                  backgroundColor: chartDimension === '2d'
                    ? theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)'
                    : theme === 'dark' ? 'transparent' : '#ffffff',
                  color: chartDimension === '2d'
                    ? theme === 'dark' ? '#93c5fd' : '#1d4ed8'
                    : theme === 'dark' ? styles.textColor : '#1f2937'
                }}
              >
                <ChartBarIcon className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">2D Charts</span>
                <p className="text-xs mt-1" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280' }}>
                  Standard charts for simple data visualization
                </p>
              </button>

              <button
                onClick={() => {
                  setChartDimension('3d');
                  // Set default 3D chart type
                  setChartType('column');
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all flex-1`}
                style={{
                  borderColor: chartDimension === '3d'
                    ? theme === 'dark' ? styles.primaryColor : '#3b82f6'
                    : theme === 'dark' ? styles.borderColor : '#e5e7eb',
                  backgroundColor: chartDimension === '3d'
                    ? theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)'
                    : theme === 'dark' ? 'transparent' : '#ffffff',
                  color: chartDimension === '3d'
                    ? theme === 'dark' ? '#93c5fd' : '#1d4ed8'
                    : theme === 'dark' ? styles.textColor : '#1f2937'
                }}
              >
                <CubeIcon className="h-10 w-10 mb-2" />
                <span className="text-sm font-medium">3D Charts</span>
                <p className="text-xs mt-1" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280' }}>
                  Interactive 3D visualizations for complex data
                </p>
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart Configuration Area - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Type Selection */}
          <Card
            variant="glassmorphic"
            title="Chart Type"
            subtitle="Select the visualization type for your data"
            icon={DocumentChartBarIcon}
            style={{
              backgroundColor: theme === 'dark' ? styles.cardBgColor : '#ffffff',
              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
              color: theme === 'dark' ? styles.textColor : '#1f2937'
            }}
            titleStyle={{
              color: theme === 'dark' ? styles.textColor : '#1f2937',
              fontWeight: '600'
            }}
            subtitleStyle={{
              color: theme === 'dark' ? styles.secondaryColor : '#6b7280'
            }}
          >
            <div className="p-4">
              {chartDimension === '2d' ? (
                <div>
                  <h3 className="text-sm font-medium mb-4 flex items-center" style={{ color: theme === 'dark' ? styles.textColor : '#1f2937' }}>
                    <ChartBarIcon className="w-5 h-5 mr-2" style={{ color: theme === 'dark' ? '#60a5fa' : '#3b82f6' }} />
                    2D Chart Types
                  </h3>

                  <div className="space-y-6">
                    {/* Basic Charts Section */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider mb-3 border-b pb-1" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280', borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb' }}>Basic Charts</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {chartTypeOptions2D.slice(0, 4).map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setChartType(option.id)}
                            className="flex flex-col items-center justify-start p-3 rounded-lg transition-all h-full"
                            style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)'
                                : theme === 'dark' ? 'transparent' : '#ffffff',
                              color: chartType === option.id
                                ? theme === 'dark' ? '#93c5fd' : '#1d4ed8'
                                : theme === 'dark' ? styles.textColor : '#1f2937',
                              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
                              borderWidth: chartType !== option.id ? '1px' : '0px',
                              boxShadow: chartType === option.id ? `0 0 0 2px ${theme === 'dark' ? '#3b82f6' : '#3b82f6'}` : 'none'
                            }}
                          >
                            <div className="p-2 rounded-full mb-2" style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
                                : theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.8)'
                            }}>
                              <option.icon className="h-6 w-6" style={{
                                color: chartType === option.id
                                  ? theme === 'dark' ? '#60a5fa' : '#3b82f6'
                                  : theme === 'dark' ? '#9ca3af' : '#6b7280'
                              }} />
                            </div>
                            <span className="text-sm font-medium">{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Statistical Charts Section */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider mb-3 border-b pb-1" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280', borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb' }}>Statistical Charts</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {chartTypeOptions2D.slice(4, 8).map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setChartType(option.id)}
                            className="flex flex-col items-center justify-start p-3 rounded-lg transition-all h-full"
                            style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)'
                                : theme === 'dark' ? 'transparent' : '#ffffff',
                              color: chartType === option.id
                                ? theme === 'dark' ? '#93c5fd' : '#1d4ed8'
                                : theme === 'dark' ? styles.textColor : '#1f2937',
                              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
                              borderWidth: chartType !== option.id ? '1px' : '0px',
                              boxShadow: chartType === option.id ? `0 0 0 2px ${theme === 'dark' ? '#3b82f6' : '#3b82f6'}` : 'none'
                            }}
                          >
                            <div className="p-2 rounded-full mb-2" style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
                                : theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.8)'
                            }}>
                              <option.icon className="h-6 w-6" style={{
                                color: chartType === option.id
                                  ? theme === 'dark' ? '#60a5fa' : '#3b82f6'
                                  : theme === 'dark' ? '#9ca3af' : '#6b7280'
                              }} />
                            </div>
                            <span className="text-sm font-medium">{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Charts Section */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider mb-3 border-b pb-1" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280', borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb' }}>Advanced Charts</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {chartTypeOptions2D.slice(8).map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setChartType(option.id)}
                            className="flex flex-col items-center justify-start p-3 rounded-lg transition-all h-full"
                            style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.05)'
                                : theme === 'dark' ? 'transparent' : '#ffffff',
                              color: chartType === option.id
                                ? theme === 'dark' ? '#93c5fd' : '#1d4ed8'
                                : theme === 'dark' ? styles.textColor : '#1f2937',
                              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
                              borderWidth: chartType !== option.id ? '1px' : '0px',
                              boxShadow: chartType === option.id ? `0 0 0 2px ${theme === 'dark' ? '#3b82f6' : '#3b82f6'}` : 'none'
                            }}
                          >
                            <div className="p-2 rounded-full mb-2" style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)'
                                : theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.8)'
                            }}>
                              <option.icon className="h-6 w-6" style={{
                                color: chartType === option.id
                                  ? theme === 'dark' ? '#60a5fa' : '#3b82f6'
                                  : theme === 'dark' ? '#9ca3af' : '#6b7280'
                              }} />
                            </div>
                            <span className="text-sm font-medium">{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium mb-4 flex items-center" style={{ color: theme === 'dark' ? styles.textColor : '#1f2937' }}>
                    <CubeIcon className="w-5 h-5 mr-2" style={{ color: theme === 'dark' ? '#a78bfa' : '#8b5cf6' }} />
                    3D Chart Types
                  </h3>

                  <div className="space-y-6">
                    {/* Basic 3D Charts */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider mb-3 border-b pb-1" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280', borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb' }}>Basic 3D Charts</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {chartTypeOptions3D.slice(0, 4).map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setChartType(option.id)}
                            className="flex flex-col items-center justify-start p-3 rounded-lg transition-all h-full"
                            style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.05)'
                                : theme === 'dark' ? 'transparent' : '#ffffff',
                              color: chartType === option.id
                                ? theme === 'dark' ? '#c4b5fd' : '#5b21b6'
                                : theme === 'dark' ? styles.textColor : '#1f2937',
                              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
                              borderWidth: chartType !== option.id ? '1px' : '0px',
                              boxShadow: chartType === option.id ? `0 0 0 2px ${theme === 'dark' ? '#8b5cf6' : '#8b5cf6'}` : 'none'
                            }}
                          >
                            <div className="p-2 rounded-full mb-2" style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.1)'
                                : theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.8)'
                            }}>
                              <option.icon className="h-6 w-6" style={{
                                color: chartType === option.id
                                  ? theme === 'dark' ? '#a78bfa' : '#8b5cf6'
                                  : theme === 'dark' ? '#9ca3af' : '#6b7280'
                              }} />
                            </div>
                            <span className="text-sm font-medium">{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced 3D Charts */}
                    <div>
                      <h4 className="text-xs uppercase tracking-wider mb-3 border-b pb-1" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280', borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb' }}>Advanced 3D Charts</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {chartTypeOptions3D.slice(4).map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setChartType(option.id)}
                            className="flex flex-col items-center justify-start p-3 rounded-lg transition-all h-full"
                            style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(124, 58, 237, 0.2)' : 'rgba(124, 58, 237, 0.05)'
                                : theme === 'dark' ? 'transparent' : '#ffffff',
                              color: chartType === option.id
                                ? theme === 'dark' ? '#c4b5fd' : '#5b21b6'
                                : theme === 'dark' ? styles.textColor : '#1f2937',
                              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
                              borderWidth: chartType !== option.id ? '1px' : '0px',
                              boxShadow: chartType === option.id ? `0 0 0 2px ${theme === 'dark' ? '#8b5cf6' : '#8b5cf6'}` : 'none'
                            }}
                          >
                            <div className="p-2 rounded-full mb-2" style={{
                              backgroundColor: chartType === option.id
                                ? theme === 'dark' ? 'rgba(124, 58, 237, 0.3)' : 'rgba(124, 58, 237, 0.1)'
                                : theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(243, 244, 246, 0.8)'
                            }}>
                              <option.icon className="h-6 w-6" style={{
                                color: chartType === option.id
                                  ? theme === 'dark' ? '#a78bfa' : '#8b5cf6'
                                  : theme === 'dark' ? '#9ca3af' : '#6b7280'
                              }} />
                            </div>
                            <span className="text-sm font-medium">{option.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Chart Details */}
          <Card
            variant="glassmorphic"
            title="Chart Details"
            subtitle="Provide a title and choose data columns"
            icon={ChartBarIcon}
            style={{
              backgroundColor: theme === 'dark' ? styles.cardBgColor : '#ffffff',
              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
              color: theme === 'dark' ? styles.textColor : '#1f2937'
            }}
            titleStyle={{
              color: theme === 'dark' ? styles.textColor : '#1f2937',
              fontWeight: '600'
            }}
            subtitleStyle={{
              color: theme === 'dark' ? styles.secondaryColor : '#6b7280'
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: theme === 'dark' ? styles.textColor : '#1f2937' }}>
                  Chart Title
                </label>
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    backgroundColor: theme === 'dark' ? styles.inputBgColor : '#ffffff',
                    color: theme === 'dark' ? styles.textColor : '#1f2937',
                    borderColor: theme === 'dark' ? styles.borderColor : '#d1d5db'
                  }}
                  placeholder="Enter descriptive chart title"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-medium" style={{ color: theme === 'dark' ? styles.textColor : '#1f2937' }}>Axis Configuration</h3>

                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: theme === 'dark' ? styles.textColor : '#1f2937' }}>
                    X-Axis Column
                  </label>
                  <select
                    value={selectedColumns.x}
                    onChange={handleXColumnChange}
                    className="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{
                      backgroundColor: theme === 'dark' ? styles.inputBgColor : '#ffffff',
                      color: theme === 'dark' ? styles.textColor : '#1f2937',
                      borderColor: theme === 'dark' ? styles.borderColor : '#d1d5db'
                    }}
                  >
                    <option style={{
                      backgroundColor: theme === 'dark' ? 'rgb(30 41 56)' : 'white',
                      color: theme === 'dark' ? 'white' : 'black'
                    }} value="">Select X-Axis Column</option>
                    {availableColumns.map((column) => (
                      <option style={{
                        backgroundColor: theme === 'dark' ? 'rgb(30 41 56)' : 'white',
                        color: theme === 'dark' ? 'white' : 'black'
                      }} key={column.name} value={column.name}>
                        {column.name} ({analyzeColumnDataType(column.name, processedFileData)})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280' }}>
                    {chartType === 'bar' || chartType === 'line' ? 'Categories for your chart' : 'Numeric values for X coordinate'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium" style={{ color: theme === 'dark' ? styles.textColor : '#1f2937' }}>
                    Y-Axis Columns (Values)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {availableColumns.map((column) => (
                      <div key={column.name} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`y-${column.name}`}
                          checked={selectedColumns.y.includes(column.name)}
                          onChange={() => handleYColumnChange(column.name)}
                          className="rounded h-4 w-4"
                          style={{
                            backgroundColor: theme === 'dark' ? styles.inputBgColor : '#ffffff',
                            borderColor: theme === 'dark' ? styles.borderColor : '#d1d5db'
                          }}
                        />
                        <label
                          htmlFor={`y-${column.name}`}
                          className="ml-2 block text-sm truncate"
                          style={{ color: theme === 'dark' ? styles.textColor : '#1f2937' }}
                        >
                          {column.name} ({analyzeColumnDataType(column.name, processedFileData)})
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280' }}>
                    Numeric values to plot on the Y-axis
                  </p>
                  {selectedColumns.y.length === 0 && (
                    <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">
                      Please select at least one Y-axis column
                    </p>
                  )}
                </div>

                {/* Z-Axis Selector for 3D Charts */}
                {chartDimension === '3d' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: theme === 'dark' ? styles.textColor : '#1f2937' }}>
                      Z-Axis Column {chartType === 'scatter' ? '(Required)' : '(Optional)'}
                    </label>
                    <select
                      value={selectedColumns.z}
                      onChange={(e) => setSelectedColumns({ ...selectedColumns, z: e.target.value })}
                      className="w-full rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{
                        backgroundColor: theme === 'dark' ? styles.inputBgColor : '#ffffff',
                        color: theme === 'dark' ? styles.textColor : '#1f2937',
                        borderColor: theme === 'dark' ? styles.borderColor : '#d1d5db'
                      }}
                    >
                      <option style={{
                        backgroundColor: theme === 'dark' ? 'rgb(30 41 56)' : 'white',
                        color: theme === 'dark' ? 'white' : 'black'
                      }} value="">Select Z-Axis Column</option>
                      {availableColumns
                        .filter(column => analyzeColumnDataType(column.name, processedFileData) === 'numeric')
                        .map((column) => (
                          <option style={{
                            backgroundColor: theme === 'dark' ? 'rgb(30 41 56)' : 'white',
                            color: theme === 'dark' ? 'white' : 'black'
                          }} key={column.name} value={column.name}>
                            {column.name} (Numeric)
                          </option>
                        ))}
                    </select>
                    <p className="text-xs" style={{ color: theme === 'dark' ? styles.secondaryColor : '#6b7280' }}>
                      {chartType === 'scatter'
                        ? 'Required for 3D scatter plots - provides depth (Z) coordinate'
                        : 'Optional for 3D column charts - adds depth dimension'}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth={true}
                  size="lg"
                  icon={CheckCircleIcon}
                  isLoading={chartLoading}
                  loadingText="Creating Chart..."
                  style={{
                    backgroundColor: theme === 'dark' ? styles.primaryColor : styles.primaryColor,
                    color: '#ffffff',
                    borderRadius: '0.375rem'
                  }}
                >
                  Create Chart
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Chart Preview Area - 3 columns */}
        <div className="lg:col-span-3">
          <Card
            variant="glassmorphic"
            title="Chart Preview"
            subtitle="Real-time visualization of your selected data"
            icon={DocumentArrowUpIcon}
            className="h-full"
            style={{
              backgroundColor: theme === 'dark' ? styles.cardBgColor : '#ffffff',
              borderColor: theme === 'dark' ? styles.borderColor : '#e5e7eb',
              color: theme === 'dark' ? styles.textColor : '#1f2937'
            }}
            titleStyle={{
              color: theme === 'dark' ? styles.textColor : '#1f2937',
              fontWeight: '600'
            }}
            subtitleStyle={{
              color: theme === 'dark' ? styles.secondaryColor : '#6b7280'
            }}
          >
            <div className="h-[60vh] w-full">
              {renderChartPreview()}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartCreation; 