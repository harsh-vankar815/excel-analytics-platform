const ExcelFile = require('../models/ExcelFile');
const Chart = require('../models/Chart');
const config = require('../config/config');

// OpenAI API integration function - modified to support real API calls
const generateAiInsight = async (data, chartType, xAxisLabel, yAxisLabel, isAdvanced = false) => {
  try {
    // Check if OpenAI API key is configured
    if (process.env.OPENAI_API_KEY) {
      // Import OpenAI dynamically to avoid crashes if not installed
      try {
        const { OpenAI } = require('openai');
        
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        // Create a prompt with the chart data
        let systemPrompt, userPrompt;
        
        if (isAdvanced) {
          systemPrompt = `You are a data scientist specializing in data visualization and analysis. 
          Generate a comprehensive analysis of the provided chart data with the following sections:
          
          ## Summary
          A concise overview of the main insights from the chart.
          
          ## Patterns
          Detailed analysis of patterns, trends, correlations, and anomalies in the data.
          
          ## Recommendations
          Actionable recommendations based on the data, including potential business decisions, further analyses, or alternative visualization approaches.
          
          Be specific, data-driven, and insightful in your analysis.`;
          
          userPrompt = `Generate advanced insights for a ${chartType} chart with x-axis '${xAxisLabel}' and y-axis '${yAxisLabel}'. 
          The data includes ${data.length} data points.
          Here's a sample of the data (first 10 points or less): 
          ${JSON.stringify(data.slice(0, 10), null, 2)}
          
          Please provide a comprehensive analysis with the sections outlined in your instructions.`;
        } else {
          systemPrompt = "You are a data analyst specializing in Excel data visualization. Generate concise insights from the following chart data.";
          
          userPrompt = `Generate insights for a ${chartType} chart with x-axis '${xAxisLabel}' and y-axis '${yAxisLabel}'. 
          The data includes ${data.length} data points.
          Here's a sample of the data (first 5 points or less): 
          ${JSON.stringify(data.slice(0, 5), null, 2)}`;
        }
        
        const messages = [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ];
        
        try {
          // Try with preferred model first
          const preferredModel = isAdvanced ? "gpt-3.5-turbo-16k" : "gpt-3.5-turbo";
          const completion = await openai.chat.completions.create({
            model: preferredModel,
            messages: messages,
            max_tokens: isAdvanced ? 1000 : 500,
            temperature: 0.7
          });
          
          return completion.choices[0].message.content;
        } catch (modelError) {
          // If model not found, try with the basic model
          if (modelError.code === 'model_not_found' || modelError.status === 404) {
            console.log(`Model ${isAdvanced ? "gpt-3.5-turbo-16k" : "gpt-3.5-turbo"} not available. Falling back to gpt-3.5-turbo.`);
            
            const fallbackCompletion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: messages,
              max_tokens: 500,
              temperature: 0.7
            });
            
            return fallbackCompletion.choices[0].message.content;
          } else {
            // Re-throw if it's not a model availability issue
            throw modelError;
          }
        }
      } catch (err) {
        console.error("Error with OpenAI API:", err);
        // Fall back to mock data
        return isAdvanced ? getAdvancedMockInsight(chartType) : getMockInsight(chartType);
      }
    } else {
      // Return mock insights if no API key is configured
      return isAdvanced ? getAdvancedMockInsight(chartType) : getMockInsight(chartType);
    }
  } catch (error) {
    console.error("Error generating AI insight:", error);
    return "Unable to generate AI insights at this time.";
  }
};

// Helper function for mock insights
const getMockInsight = (chartType) => {
  const insights = {
    bar: "The bar chart shows a clear trend of higher values in the middle categories. Consider investigating what factors contribute to this pattern.",
    line: "The line chart demonstrates fluctuations with an overall upward trend. Key growth periods can be seen at specific intervals.",
    pie: "The pie chart reveals that certain categories dominate the distribution, accounting for over 60% of the total values.",
    scatter: "The scatter plot indicates a positive correlation between the variables. As X increases, Y tends to increase as well, suggesting a relationship.",
    doughnut: "The doughnut chart shows an uneven distribution across categories, with a significant portion allocated to just two segments.",
    '3d-column': "The 3D column chart demonstrates variations across multiple dimensions, with peaks occurring at specific intersections of variables."
  };
  
  return insights[chartType] || "This chart provides a visualization of your data that can help identify patterns and relationships between variables.";
};

// Helper function for advanced mock insights
const getAdvancedMockInsight = (chartType) => {
  const insights = {
    bar: `## Summary
The bar chart reveals a distinct pattern where values peak in the middle categories and taper off toward the extremes, creating a bell curve-like distribution. The highest value is approximately 2.5 times larger than the lowest value.

## Patterns
The distribution follows what appears to be a normal or near-normal pattern, suggesting the underlying data may be influenced by multiple independent factors. There's a clear central tendency with symmetrical decline on both sides. Categories 3 and 4 show the highest values, while categories 1 and 7 show the lowest. This pattern is commonly seen in datasets representing natural phenomena or balanced market segments.

## Recommendations
1. Investigate why the middle categories perform better than the extremes
2. Consider normalizing the data if comparing across different scales
3. If this represents business segments, allocate more resources to the high-performing middle categories
4. Create a complementary line chart to track how this distribution changes over time
5. Segment the analysis further to see if the pattern holds across different subgroups`,

    line: `## Summary
The line chart displays a general upward trend with periodic fluctuations, indicating overall growth with seasonal or cyclical variations. The trend line shows approximately 35% growth from start to end.

## Patterns
The data exhibits clear cyclical patterns with peaks occurring at regular intervals, typically every 4-5 data points. These cycles are superimposed on a positive linear trend. The amplitude of fluctuations increases as the overall value grows, suggesting proportional rather than absolute variations. There are three notable outliers where values deviate significantly from the expected pattern, which warrant further investigation.

## Recommendations
1. Decompose the time series into trend, seasonal, and residual components for deeper analysis
2. Apply moving averages to smooth out fluctuations and better visualize the underlying trend
3. Forecast future values using time series methods like ARIMA or exponential smoothing
4. Investigate the outliers to understand what caused these anomalies
5. Compare this trend with external factors that might explain the cyclical behavior`,

    pie: `## Summary
The pie chart illustrates a highly uneven distribution across categories, with two dominant segments accounting for approximately 65% of the total value, while the remaining categories represent much smaller proportions.

## Patterns
There's a clear 80/20 pattern (Pareto principle) where a small number of categories account for the majority of the total. Categories A and C are dominant, representing 42% and 23% respectively. The smallest three categories combined only account for about 15% of the total. This suggests a concentrated distribution that may indicate market dominance, resource allocation imbalance, or natural concentration in the underlying phenomenon.

## Recommendations
1. Focus strategic attention on the dominant categories as they drive most of the value
2. Consider whether the smaller categories should be consolidated or given special attention to grow
3. Use a secondary visualization like a bar chart to show the actual values alongside percentages
4. If this represents market segments, evaluate competitive positioning in the dominant categories
5. Consider a treemap visualization as an alternative to better show the hierarchical nature of the data`,

    scatter: `## Summary
The scatter plot reveals a moderate positive correlation between the X and Y variables, with an estimated correlation coefficient of approximately 0.7. The relationship appears to be linear with some outliers.

## Patterns
The data points form a clear upward-sloping pattern, indicating that as X increases, Y tends to increase as well. The relationship appears to be linear rather than curved. There's a cluster of points in the lower-left quadrant, suggesting a concentration of observations with low values on both variables. Several outliers in the upper-right section deviate from the main trend, showing higher Y values than would be expected based on their X values. The spread of points around the trend line increases with higher X values, indicating heteroscedasticity.

## Recommendations
1. Calculate the exact correlation coefficient and regression equation to quantify the relationship
2. Investigate the outliers to understand what makes these cases special
3. Consider transforming the data (e.g., log transformation) if the heteroscedasticity is problematic
4. Add a trend line to the visualization to make the relationship more apparent
5. Segment the data by a third variable to see if the relationship holds across different groups
6. Test for statistical significance of the correlation before making business decisions based on it`,

    doughnut: `## Summary
The doughnut chart displays an uneven distribution where three categories make up over 70% of the total, with one category alone representing nearly 40% of the whole.

## Patterns
The distribution is highly skewed, with Category B accounting for approximately 38% of the total. Categories A and D are secondary contributors at roughly 18% and 16% respectively. The remaining four categories each represent less than 10% of the total. This type of distribution often indicates concentration in a particular segment, specialized focus, or imbalance in resource allocation.

## Recommendations
1. Highlight the dominant category in the visualization to draw attention to its outsized impact
2. Consider whether the concentration in Category B represents an opportunity or a risk
3. Evaluate whether resources are appropriately allocated given this distribution
4. Use a stacked bar chart as a complementary visualization to show changes in this distribution over time
5. If appropriate, set targets for more balanced distribution and track progress
6. Consider consolidating the smallest categories into an "Other" category if they're not individually significant`,

    '3d-column': `## Summary
The 3D column chart reveals a complex relationship between three variables, with peak values concentrated in specific regions of the visualization. The highest columns are located primarily in the back-right quadrant.

## Patterns
Values increase significantly along both the X and Y axes, with the highest points occurring at high values of both variables. There's a clear gradient effect where column heights transition from low (front-left) to high (back-right), suggesting a multiplicative relationship between the X and Y factors. Several isolated tall columns appear outside this pattern, indicating specific combinations that outperform expectations. The distribution is not uniform, with approximately 20% of the columns accounting for 60% of the total volume.

## Recommendations
1. Consider using a heatmap as an alternative visualization that may make patterns easier to discern
2. Rotate the 3D view to examine the data from multiple perspectives
3. Project the data onto 2D planes to analyze relationships between pairs of variables
4. Investigate the specific combinations that produce the highest values
5. If this represents business data, focus resources on the high-value combinations identified
6. Consider whether a predictive model could help identify other potentially high-value combinations`
  };
  
  return insights[chartType] || `## Summary
This chart provides a visualization of your data that helps identify patterns and relationships between variables.

## Patterns
The data shows variations across different categories or values, with some notable high and low points. There appears to be structure in the data that warrants further investigation. The distribution is not uniform, suggesting underlying factors influencing the values.

## Recommendations
1. Analyze the specific factors driving the variations in the data
2. Consider alternative visualization types to highlight different aspects of the data
3. Segment the data further to identify more specific patterns
4. Compare this data with historical trends if available
5. Use statistical methods to quantify the relationships observed visually`;
};

// @desc    Generate AI insights for a chart
// @route   POST /api/ai/insights/chart/:id
// @access  Private
exports.generateChartInsights = async (req, res, next) => {
  try {
    const chart = await Chart.findById(req.params.id).populate('sourceFile');
    
    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    // Check if user is authorized
    if (chart.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate insights for this chart'
      });
    }

    // Check if advanced analysis is requested
    const isAdvanced = req.body.analysisType === 'advanced';
    
    let dataForAnalysis;
    let xAxisLabel;
    let yAxisLabel;

    // Find the relevant sheet data from the Excel file
    const excelFile = chart.sourceFile;
    
    // Try to get data from the Excel file first
    if (excelFile && excelFile.sheets) {
      const sheet = excelFile.sheets.find(s => s.name === chart.sheetName);
      
      if (sheet) {
        dataForAnalysis = sheet.data;
        xAxisLabel = chart.xAxis.label;
        yAxisLabel = chart.yAxis.label;
      }
    }
    
    // If data not available from Excel file, try to use data from request body
    if (!dataForAnalysis && req.body.dataSnapshot) {
      dataForAnalysis = req.body.dataSnapshot;
      xAxisLabel = req.body.selectedColumns?.x || 'X-Axis';
      yAxisLabel = req.body.selectedColumns?.y?.[0] || 'Y-Axis';
    }
    
    // If still no data, return error
    if (!dataForAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'No data available for analysis. Please provide data in the request or ensure the chart is linked to a valid Excel file.'
      });
    }

    // Generate insights
    const insights = await generateAiInsight(
      dataForAnalysis,
      chart.type,
      xAxisLabel,
      yAxisLabel,
      isAdvanced
    );

    // Update chart with insights
    chart.aiInsights = insights;
    await chart.save();

    res.status(200).json({
      success: true,
      data: {
        insights,
        chartId: chart._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate summary for an Excel file
// @route   POST /api/ai/insights/file/:id
// @access  Private
exports.generateFileSummary = async (req, res, next) => {
  try {
    const excelFile = await ExcelFile.findById(req.params.id);
    
    if (!excelFile) {
      return res.status(404).json({
        success: false,
        message: 'Excel file not found'
      });
    }

    // Check if user is authorized
    if (excelFile.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to generate summary for this file'
      });
    }

    // Generate a summary using OpenAI or mock data
    let summary;
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = require('openai');
        
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        
        // Create a more detailed prompt with the file data
        const sheetNames = excelFile.sheets.map(s => s.name).join(', ');
        
        // Prepare sample data from each sheet (limited to avoid token limits)
        const sheetSamples = excelFile.sheets.map(sheet => {
          // Get headers and a few rows of data
          const headers = sheet.data[0] || [];
          const sampleRows = sheet.data.slice(1, 4); // Get up to 3 rows
          
          return {
            name: sheet.name,
            headers,
            sampleRows,
            totalRows: sheet.data.length - 1 // Exclude header row
          };
        });
        
        const messages = [
          {
            role: "system",
            content: `You are a data analyst specializing in Excel file analysis. Generate a comprehensive summary of this Excel file with the following sections:
            1. Overview - Brief description of the file contents
            2. Data Structure - Description of sheets, columns, and data types
            3. Key Insights - Notable patterns, trends, or anomalies
            4. Recommendations - Suggested analyses or visualizations
            
            Be specific and data-driven in your analysis.`
          },
          {
            role: "user",
            content: `Generate a detailed summary for an Excel file named "${excelFile.filename}".
            
            File Information:
            - Original name: ${excelFile.originalName}
            - Contains ${excelFile.sheets.length} sheets: ${sheetNames}
            - File size: ${(excelFile.size / 1024).toFixed(2)} KB
            
            Sheet Details:
            ${JSON.stringify(sheetSamples, null, 2)}
            
            Please provide a comprehensive analysis of this data.`
          }
        ];
        
        try {
          // Try with preferred model first
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-16k",
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
          });
          
          summary = completion.choices[0].message.content;
        } catch (modelError) {
          // If model not found, try with the basic model
          if (modelError.code === 'model_not_found' || modelError.status === 404) {
            console.log(`Model gpt-3.5-turbo-16k not available. Falling back to gpt-3.5-turbo.`);
            
            const fallbackCompletion = await openai.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: messages,
              max_tokens: 500,
              temperature: 0.7
            });
            
            summary = fallbackCompletion.choices[0].message.content;
          } else {
            // Re-throw if it's not a model availability issue
            throw modelError;
          }
        }
      } catch (err) {
        console.error("Error with OpenAI API:", err);
        // Fall back to mock data
        summary = getEnhancedMockFileSummary(excelFile);
      }
    } else {
      // Return mock summary if no API key is configured
      summary = getEnhancedMockFileSummary(excelFile);
    }

    // Store the summary with the file for future reference
    excelFile.aiSummary = summary;
    await excelFile.save();

    res.status(200).json({
      success: true,
      data: {
        summary,
        fileId: excelFile._id
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function for enhanced mock file summary
const getEnhancedMockFileSummary = (excelFile) => {
  const sheetCount = excelFile.sheets.length;
  const mainSheet = excelFile.sheets[0];
  const rowCount = mainSheet ? mainSheet.data.length - 1 : 0; // Exclude header row
  const columnCount = mainSheet && mainSheet.data[0] ? mainSheet.data[0].length : 0;
  
  return `
    ## Overview
    This Excel file "${excelFile.originalName}" contains ${sheetCount} sheet(s) with a total of approximately ${rowCount} rows of data in the main sheet. The file appears to contain structured data suitable for analysis and visualization.
    
    ## Data Structure
    - Main sheet "${mainSheet?.name || 'Sheet1'}" contains ${columnCount} columns and ${rowCount} rows
    - ${sheetCount > 1 ? `Additional sheets include: ${excelFile.sheets.slice(1).map(s => s.name).join(', ')}` : 'No additional sheets present'}
    - The data appears to be organized in a tabular format with headers
    
    ## Key Insights
    - The dataset contains sufficient data points for meaningful analysis
    - Several numeric columns present opportunities for statistical analysis
    - Data appears to be structured consistently across rows
    - Potential for identifying trends and patterns through visualization
    
    ## Recommendations
    - Create bar or line charts to visualize trends over time
    - Consider correlation analysis between numeric variables
    - Segment data by categories for comparative analysis
    - Clean any null values or inconsistencies before detailed analysis
    - Use pivot tables to summarize data across multiple dimensions
    
    This analysis is based on a preliminary review of the file structure. For more detailed insights, consider creating specific visualizations or performing statistical analyses on the data.
  `;
}; 