/**
 * Script to fix charts with missing data field
 * 
 * Run this script with: node scripts/fixChartData.js
 */

const mongoose = require('mongoose');
const config = require('../config/config');

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import Chart model
const Chart = require('../models/Chart');

// Chart ID to fix
const chartId = '681ce483a29ff553cad2b4de';

async function fixChart() {
  try {
    // Find the chart
    const chart = await Chart.findById(chartId);
    
    if (!chart) {
      console.error(`Chart with ID ${chartId} not found`);
      process.exit(1);
    }
    
    console.log('Found chart:', chart.title);
    
    // Check if chart already has data field
    if (chart.data) {
      console.log('Chart already has data field. No fix needed.');
      process.exit(0);
    }
    
    // Add default data structure
    chart.data = {
      labels: [],
      datasets: [],
      source: []
    };
    
    // Save the updated chart
    await chart.save();
    
    console.log('Chart updated successfully with default data structure');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing chart:', error);
    process.exit(1);
  }
}

// Run the fix
fixChart(); 