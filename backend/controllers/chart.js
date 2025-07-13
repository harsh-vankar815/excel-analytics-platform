const Chart = require('../models/Chart');
const ExcelFile = require('../models/ExcelFile');
const { isValidObjectId } = require('../utils/validators');
const { logActivity } = require('../middleware/logger');

// @desc    Create a new chart
// @route   POST /api/charts
// @access  Private
exports.createChart = async (req, res, next) => {
  try {
    let {
      title,
      description,
      type,
      sourceFile,
      sheetName,
      config,
      data,
      xAxis,
      yAxis,
      zAxis,
      filters,
      isPublic
    } = req.body;

    console.log('Chart creation payload received:', {
      title,
      type,
      sourceFile,
      hasConfig: !!config,
      hasData: !!data,
      hasXAxis: !!xAxis,
      hasYAxis: !!yAxis
    });

    // Validate required fields
    if (!title || !type || !sourceFile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, type, and sourceFile'
      });
    }

    // Ensure we have either config or data
    if (!config && !data) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either config or data for the chart'
      });
    }

    // Check if excel file exists and user has access
    const excelFile = await ExcelFile.findById(sourceFile);
    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check if user is owner of the excel file
    if (excelFile.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create charts for this file'
      });
    }

    // If data is provided but not config, create a config from data
    let finalConfig = config || {};
    if (data && !config) {
      finalConfig = {
        labels: data.labels || [],
        datasets: data.datasets || [],
        data: {
          labels: data.labels || [],
          datasets: data.datasets || []
        },
        // Save additional data that might be needed for editing/rendering
        dimension: data.dimension || '2d',
        chartType: type,
        source: data.source || []
      };
    } else if (config && !config.data && data) {
      // If config doesn't have a data property but data is provided separately
      finalConfig = {
        ...config,
        data: {
          labels: data.labels || [],
          datasets: data.datasets || []
        }
      };
    }

    // Create chart with validated data
    const chart = await Chart.create({
      title,
      description: description || '',
      type,
      configuration: finalConfig,
      sourceFile: sourceFile,
      sheetName: sheetName || excelFile.sheets[0]?.name || 'Sheet1',
      config: finalConfig,
      xAxis: xAxis || {},
      yAxis: yAxis || {},
      zAxis: zAxis || null,
      filters: filters || [],
      createdBy: req.user._id,
      isPublic: isPublic || false,
      data: data || null // Store the original data as well if provided
    });

    // Log activity
    await logActivity(req, req.user, 'CREATE_CHART', `Created chart: ${title}`);

    res.status(201).json({
      success: true,
      data: chart
    });
  } catch (error) {
    console.error('Error creating chart:', error);
    next(error);
  }
};

// @desc    Get all charts for current user
// @route   GET /api/charts
// @access  Private
exports.getCharts = async (req, res, next) => {
  try {
    const charts = await Chart.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sourceFile', 'name originalName');
    
    res.status(200).json({
      success: true,
      count: charts.length,
      data: charts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a chart by ID
// @route   GET /api/charts/:id
// @access  Private
exports.getChart = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Fetching chart with ID:', id);
    
    if (!isValidObjectId(id)) {
      console.log('Invalid chart ID format:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid chart ID format'
      });
    }
    
    const chart = await Chart.findById(id).populate('sourceFile', 'name originalName sheets');
    
    if (!chart) {
      console.log('Chart not found for ID:', id);
      return res.status(404).json({
        success: false,
        message: `Chart not found with id ${id}`
      });
    }

    // Check if user is authorized to view
    if (!chart.isPublic && 
        chart.createdBy.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      console.log('User not authorized to view chart. Chart owner:', chart.createdBy, 'Requesting user:', req.user._id);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chart'
      });
    }

    // Increment view count
    chart.viewCount += 1;
    await chart.save();
    
    console.log('Chart found and returned successfully');
    
    res.status(200).json({
      success: true,
      data: chart
    });
  } catch (error) {
    console.error('Error in getChart controller:', error);
    next(error);
  }
};

// @desc    Update a chart
// @route   PUT /api/charts/:id
// @access  Private
exports.updateChart = async (req, res, next) => {
  try {
    let chart = await Chart.findById(req.params.id);
    
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    // Check if user is owner of the chart
    if (chart.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this chart'
      });
    }

    // Update chart
    chart = await Chart.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Log activity
    await logActivity(req, req.user, 'UPDATE_CHART', `Updated chart: ${chart.title}`);

    res.status(200).json({
      success: true,
      data: chart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a chart
// @route   DELETE /api/charts/:id
// @access  Private
exports.deleteChart = async (req, res, next) => {
  try {
    const chart = await Chart.findById(req.params.id);
    
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    // Check if user is owner of the chart
    if (chart.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chart'
      });
    }

    await chart.deleteOne();

    // Log activity
    await logActivity(req, req.user, 'DELETE_CHART', `Deleted chart: ${chart.title}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get most viewed charts (top 5)
// @route   GET /api/charts/most-viewed
// @access  Private
exports.getMostViewedCharts = async (req, res, next) => {
  try {
    const charts = await Chart.find({ createdBy: req.user._id })
      .sort({ viewCount: -1 })
      .limit(5)
      .populate('sourceFile', 'name originalName');
    
    res.status(200).json({
      success: true,
      data: charts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get charts for a specific Excel file
// @route   GET /api/charts/file/:fileId
// @access  Private
exports.getChartsByFile = async (req, res, next) => {
  try {
    const excelFile = await ExcelFile.findById(req.params.fileId);
    
    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check if user is owner of the file
    if (excelFile.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view charts for this file'
      });
    }

    const charts = await Chart.find({ 
      sourceFile: req.params.fileId,
      createdBy: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: charts.length,
      data: charts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI insights for a chart
// @route   POST /api/chart/insights
// @access  Private
exports.generateInsights = async (req, res, next) => {
  try {
    const { dataSnapshot, columnInfo, selectedColumns, chartType } = req.body;

    if (!dataSnapshot || !columnInfo || !selectedColumns || !chartType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide data snapshot, column info, selected columns, and chart type'
      });
    }

    // Generate insights based on the provided data
    // This is a placeholder implementation - in production this would call an AI API
    const insights = generateInsightText(dataSnapshot, columnInfo, selectedColumns, chartType);

    res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate insights for different chart types
const generateInsightText = (dataSnapshot, columnInfo, selectedColumns, chartType) => {
  // This function would typically call an external AI API, but for now we'll use predefined templates

  // Extract the column data we need for analysis
  const xColumn = selectedColumns.x;
  const yColumns = selectedColumns.y;
  
  // Simple statistics for numeric columns
  const getColumnStats = (columnName) => {
    const values = dataSnapshot
      .map(row => parseFloat(row[columnName]))
      .filter(val => !isNaN(val));
    
    if (values.length === 0) return null;
    
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const maxItem = dataSnapshot.find(item => parseFloat(item[columnName]) === max);
    const minItem = dataSnapshot.find(item => parseFloat(item[columnName]) === min);
    
    return {
      avg: avg.toFixed(2),
      max,
      min,
      maxItem,
      minItem,
      sum: sum.toFixed(2)
    };
  };
  
  // Generate basic insights based on chart type
  let insightText = '';
  
  switch (chartType) {
    case 'bar':
    case 'column':
      const barStats = getColumnStats(yColumns[0]);
      if (barStats) {
        insightText = `This ${chartType} chart displays ${xColumn} values against ${yColumns.join(', ')}. 
        
The average value is ${barStats.avg}, with a maximum of ${barStats.max} (${barStats.maxItem[xColumn]}) and a minimum of ${barStats.min} (${barStats.minItem[xColumn]}). 

This visualization helps identify the highest and lowest performing categories at a glance.`;
      }
      break;
    
    case 'line':
      insightText = `This line chart tracks changes in ${yColumns.join(', ')} over ${xColumn}. 

The visualization allows you to identify trends, seasonal patterns, and potential anomalies in your time-series data.

To gain deeper insights, consider analyzing the slope between consecutive points to identify periods of growth or decline.`;
      break;
    
    case 'pie':
    case 'doughnut':
      insightText = `This ${chartType} chart shows the distribution of ${yColumns[0]} across different ${xColumn} categories. 

It's particularly effective for visualizing part-to-whole relationships and percentage distributions.

For better readability, consider organizing segments from largest to smallest or grouping smaller segments into an "Other" category.`;
      break;
    
    case 'scatter':
      insightText = `This scatter plot visualizes the relationship between ${xColumn} and ${yColumns.join(', ')}. 

Look for clusters, outliers, and correlation patterns in the data. Dense areas indicate common value combinations, while isolated points may represent anomalies.

Consider adding a trend line to highlight the overall relationship direction between variables.`;
      break;
    
    case 'radar':
      insightText = `This radar chart compares multiple variables (${yColumns.join(', ')}) across ${xColumn} categories. 

The shape of the polygon reveals strengths and weaknesses across dimensions. Larger areas indicate better overall performance.

This visualization is ideal for performance comparisons and identifying balanced or imbalanced profiles.`;
      break;
    
    case '3d-column':
    case '3d-bar':
      insightText = `This 3D ${chartType === '3d-column' ? 'column' : 'bar'} chart adds depth to your visualization, representing ${yColumns.join(', ')} values across ${xColumn} categories.

The third dimension enhances visual comparison but may slightly complicate precise value comparison.

Rotate the chart to view from different angles for a comprehensive understanding of the data relationships.`;
      break;
    
    case '3d-scatter':
      insightText = `This 3D scatter plot visualizes the relationship between three variables: ${xColumn}, ${yColumns[0]}, and ${selectedColumns.z || 'Z-axis'}.

Look for patterns in the three-dimensional space that might not be apparent in 2D visualizations.

Clusters in 3D space can reveal complex relationships between all three variables simultaneously.`;
      break;
    
    default:
      insightText = `This ${chartType} chart visualizes the relationship between ${xColumn} and ${yColumns.join(', ')}.

Examine the patterns to identify trends, outliers, and potential correlations in your data.

Consider exploring different chart types to highlight different aspects of your dataset.`;
  }
  
  // Add a general conclusion
  insightText += `

To further analyze this data, you might consider:
- Filtering specific categories to focus on key areas
- Comparing this data with historical periods to identify changes
- Exporting the chart for inclusion in reports or presentations`;
  
  return insightText;
};

// @desc    Save chart as template
// @route   POST /api/charts/:id/save-template
// @access  Private
exports.saveChartAsTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { templateName } = req.body;

    // Check if template name was provided
    if (!templateName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a template name'
      });
    }

    // Find the original chart
    const originalChart = await Chart.findById(id);
    
    if (!originalChart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    // Check if user is owner of the chart
    if (originalChart.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to save this chart as template'
      });
    }

    // Ensure we have the required data field
    const chartData = originalChart.data || { labels: [], datasets: [], source: [] };

    // Create a new chart template based on the original chart
    const chartTemplate = await Chart.create({
      title: originalChart.title,
      description: originalChart.description,
      type: originalChart.type,
      sourceFile: originalChart.sourceFile,
      sheetName: originalChart.sheetName || 'Sheet1',
      config: originalChart.config || originalChart.configuration || {},
      configuration: originalChart.configuration || originalChart.config || {},
      data: chartData,
      xAxis: originalChart.xAxis || {},
      yAxis: originalChart.yAxis || {},
      zAxis: originalChart.zAxis || null,
      filters: originalChart.filters || [],
      createdBy: req.user._id,
      isSavedTemplate: true,
      templateName
    });

    res.status(201).json({
      success: true,
      data: chartTemplate
    });
  } catch (error) {
    console.error('Error saving chart as template:', error);
    next(error);
  }
};

// @desc    Get saved chart templates for current user
// @route   GET /api/charts/templates
// @access  Private
exports.getChartTemplates = async (req, res, next) => {
  try {
    const templates = await Chart.find({ 
      createdBy: req.user._id,
      isSavedTemplate: true
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply chart template to create new chart
// @route   POST /api/charts/templates/:id/apply
// @access  Private
exports.applyChartTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sourceFile, title } = req.body;

    // Validate required fields
    if (!sourceFile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an Excel file ID'
      });
    }

    // Find the template
    const template = await Chart.findById(id);
    
    if (!template || !template.isSavedTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if template belongs to user
    if (template.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to use this template'
      });
    }

    // Check if excel file exists and user has access
    const excelFile = await ExcelFile.findById(sourceFile);
    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check if user is owner of the excel file
    if (excelFile.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create charts for this file'
      });
    }

    // Ensure template has the required data field
    const templateData = template.data || { labels: [], datasets: [], source: [] };

    // Create a new chart from template
    const newChart = await Chart.create({
      title: title || `${template.title} (from template)`,
      description: template.description,
      type: template.type,
      sourceFile: sourceFile,
      sheetName: template.sheetName || excelFile.sheets[0]?.name || 'Sheet1',
      config: template.config || template.configuration || {},
      configuration: template.configuration || template.config || {},
      data: templateData,
      xAxis: template.xAxis || {},
      yAxis: template.yAxis || {},
      zAxis: template.zAxis || null,
      filters: template.filters || [],
      createdBy: req.user._id,
      isSavedTemplate: false
    });

    res.status(201).json({
      success: true,
      data: newChart
    });
  } catch (error) {
    console.error('Error applying chart template:', error);
    next(error);
  }
}; 
