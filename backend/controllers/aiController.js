const OpenAI = require('openai');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.generateInsights = catchAsync(async (req, res, next) => {
  const { data } = req.body;
  
  if (!data) {
    return next(new AppError('Please provide data for analysis', 400));
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a data analyst expert. Analyze the following Excel data and provide meaningful insights."
        },
        {
          role: "user",
          content: `Please analyze this data and provide key insights: ${JSON.stringify(data)}`
        }
      ],
      max_tokens: 500
    });

    res.status(200).json({
      status: 'success',
      insights: completion.choices[0].message.content
    });
  } catch (error) {
    return next(new AppError('Error generating insights. Please try again.', 500));
  }
});

exports.generateSummaryReport = catchAsync(async (req, res, next) => {
  const { data, chartConfig } = req.body;

  if (!data || !chartConfig) {
    return next(new AppError('Please provide both data and chart configuration', 400));
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a data visualization expert. Create a summary report based on the chart data and configuration."
        },
        {
          role: "user",
          content: `Please create a summary report for this visualization: Data: ${JSON.stringify(data)}, Chart Config: ${JSON.stringify(chartConfig)}`
        }
      ],
      max_tokens: 750
    });

    res.status(200).json({
      status: 'success',
      report: completion.choices[0].message.content
    });
  } catch (error) {
    return next(new AppError('Error generating summary report. Please try again.', 500));
  }
}); 