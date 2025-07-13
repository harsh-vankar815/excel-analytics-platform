/**
 * Script to fix charts missing the configuration field
 * 
 * Run this script with: node scripts/fixChartConfiguration.js
 */

const mongoose = require('mongoose');

// MongoDB URI - replace with your actual connection string
const MONGO_URI = 'mongodb://localhost:27017/excel-analytics';

async function fixChartConfiguration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
    
    // Get direct access to the MongoDB collection
    const chartCollection = mongoose.connection.collection('charts');
    
    // Find charts without configuration field
    const chartsWithoutConfig = await chartCollection.find({ configuration: { $exists: false } }).toArray();
    
    if (chartsWithoutConfig.length === 0) {
      console.log('No charts found without configuration field');
      process.exit(0);
    }
    
    console.log(`Found ${chartsWithoutConfig.length} charts without configuration field:`);
    
    // Fix each chart
    for (const chart of chartsWithoutConfig) {
      console.log(`Fixing chart: ${chart._id}, Title: ${chart.title || 'No title'}`);
      
      // Add default configuration
      const defaultConfig = {
        dimension: chart.type.includes('3d') ? '3d' : '2d',
        showGrid: true,
        showLabels: true,
        chartType: chart.type
      };
      
      // Update the chart
      const result = await chartCollection.updateOne(
        { _id: chart._id },
        { $set: { configuration: defaultConfig } }
      );
      
      if (result.modifiedCount === 1) {
        console.log(`Successfully fixed chart: ${chart._id}`);
      } else {
        console.log(`Failed to fix chart: ${chart._id}`);
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing chart configuration:', error);
    process.exit(1);
  }
}

// Run the script
fixChartConfiguration(); 