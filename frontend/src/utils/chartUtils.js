/**
 * Chart creation utilities to ensure all required fields are properly formatted
 */

/**
 * Creates a properly structured chart payload with all required fields
 * 
 * @param {Object} params Chart creation parameters
 * @returns {Object} Properly formatted chart payload
 */
export const createChartPayload = ({
  title,
  fileId,
  chartType,
  chartDimension,
  selectedColumns,
  processedFileData,
  sheetName = 'Sheet1'
}) => {
  if (!title || !fileId || !chartType || !selectedColumns || !processedFileData) {
    throw new Error('Missing required parameters for chart creation');
  }

  // Format labels (X-axis data)
  const labels = processedFileData.map(row => {
    const value = row[selectedColumns.x];
    return value !== undefined && value !== null ? String(value) : '';
  });

  // Create the datasets with proper formatting
  const datasets = selectedColumns.y.map((yColumn, index) => {
    // Get data for this column
    const yData = processedFileData.map(row => {
      const rawValue = row[yColumn];
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        return 0;
      }
      const value = parseFloat(rawValue);
      return isNaN(value) ? 0 : value;
    });

    // Generate a color for this dataset
    const colors = [
      '#60A5FA', '#34D399', '#F97316', '#A78BFA', '#EC4899', '#06B6D4'
    ];
    const color = colors[index % colors.length];

    // Return dataset object
    return {
      label: yColumn,
      data: yData,
      borderColor: color,
      backgroundColor: `${color}80`,
      borderWidth: 2
    };
  });

  // Create a detailed axis configuration to ensure data persists
  const xAxisConfig = {
    field: selectedColumns.x,
    label: selectedColumns.x,
    type: getColumnType(selectedColumns.x, processedFileData),
    data: labels
  };

  const yAxisConfig = selectedColumns.y.map(column => ({
    field: column,
    label: column,
    type: getColumnType(column, processedFileData),
    data: processedFileData.map(row => {
      const value = parseFloat(row[column]);
      return isNaN(value) ? 0 : value;
    })
  }));

  // Create the chart configuration
  const chartConfig = {
    dimension: chartDimension || '2d',
    showGrid: true,
    showLabels: true,
    chartType,
    // Include specific chart configuration
    chartConfig: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          display: true
        },
        title: {
          display: true,
          text: title.trim()
        }
      }
    }
  };

  // EXACT MATCH for backend requirements based on the controller code
  return {
    title: title.trim(),
    description: `Chart showing ${selectedColumns.y.join(', ')} by ${selectedColumns.x}`,
    type: chartDimension === '3d' ? `3d-${chartType}` : chartType,
    sourceFile: fileId,
    excelFileId: fileId,
    sheetName,
    data: {
      labels,
      datasets,
      // Include raw data to ensure persistence
      source: processedFileData.slice(0, 100), // Limit to 100 rows for efficiency
      selectedColumns
    },
    // Backend controller requires these fields
    config: chartConfig,
    // Add the required configuration field that matches the Mongoose schema
    configuration: chartConfig,
    // Detailed axis configuration
    xAxis: xAxisConfig,
    yAxis: yAxisConfig,
    zAxis: selectedColumns.z ? {
      field: selectedColumns.z,
      label: selectedColumns.z,
      type: getColumnType(selectedColumns.z, processedFileData),
      data: processedFileData.map(row => row[selectedColumns.z])
    } : null,
    // Save column metadata
    columns: {
      x: selectedColumns.x,
      y: selectedColumns.y,
      z: selectedColumns.z || null
    }
  };
};

/**
 * Determine the data type of a column
 * 
 * @param {string} columnName The name of the column
 * @param {Array} data The data array
 * @returns {string} The data type ('string', 'number', 'date', etc.)
 */
function getColumnType(columnName, data) {
  // Get a sample of values (first 10 non-null values)
  const values = [];
  for (let i = 0; i < data.length && values.length < 10; i++) {
    const value = data[i][columnName];
    if (value !== null && value !== undefined) {
      values.push(value);
    }
  }

  if (values.length === 0) return 'unknown';

  // Check if all values are numbers
  const allNumbers = values.every(v => {
    const num = parseFloat(v);
    return !isNaN(num);
  });

  if (allNumbers) return 'number';

  // Check if all values are dates
  const allDates = values.every(v => {
    const date = new Date(v);
    return !isNaN(date.getTime());
  });

  if (allDates) return 'date';

  // Default to string
  return 'string';
}

/**
 * Validates that the data is in the proper format for chart creation
 * 
 * @param {Object} selectedColumns The selected column configuration
 * @param {Array} processedFileData The data to validate
 * @returns {boolean} True if the data is valid, false otherwise
 */
export const validateChartData = (selectedColumns, processedFileData) => {
  if (!selectedColumns || !processedFileData || processedFileData.length === 0) {
    console.error('Chart validation failed: Missing data or columns');
    return false;
  }

  // Check if selected columns exist in the data
  const sampleRow = processedFileData[0];
  
  if (!selectedColumns.x || !sampleRow.hasOwnProperty(selectedColumns.x)) {
    console.error('Chart validation failed: Missing or invalid X column', selectedColumns.x);
    return false;
  }

  if (!selectedColumns.y || selectedColumns.y.length === 0) {
    console.error('Chart validation failed: No Y columns selected');
    return false;
  }

  // Check that all Y columns exist in the data
  for (const yColumn of selectedColumns.y) {
    if (!yColumn || yColumn === '') {
      console.error('Chart validation failed: Empty Y column name detected');
      return false;
    }
    
    if (!sampleRow.hasOwnProperty(yColumn)) {
      console.error('Chart validation failed: Missing or invalid Y column', yColumn);
      return false;
    }
  }
  
  return true;
}; 