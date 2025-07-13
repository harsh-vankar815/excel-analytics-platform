/**
 * Script to fix all charts with missing data field
 * 
 * Run this script with: node scripts/fixAllChartData.js
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

async function fixAllCharts() {
  try {
    // Find all charts without data field
    // Note: This is a bit tricky in MongoDB, as we need to find documents where a field doesn't exist
    const charts = await Chart.find({ data: { $exists: false } });
    
    console.log(`Found ${charts.length} charts missing data field`);
    
    if (charts.length === 0) {
      console.log('No charts need fixing. Exiting.');
      process.exit(0);
    }
    
    // Update each chart
    for (const chart of charts) {
      console.log(`Fixing chart: ${chart._id} - ${chart.title}`);
      
      // Add default data structure
      chart.data = {
        labels: [],
        datasets: [],
        source: []
      };
      
      // Save the updated chart
      await chart.save();
      console.log(`Fixed chart: ${chart._id}`);
    }
    
    console.log(`Successfully fixed ${charts.length} charts`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing charts:', error);
    process.exit(1);
  }
}

// Run the fix
fixAllCharts(); 