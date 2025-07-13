/**
 * Script to inspect the structure of all charts in the database
 * 
 * Run this script with: node scripts/inspectCharts.js
 */

const mongoose = require('mongoose');

// MongoDB URI - replace with your actual connection string
const MONGO_URI = 'mongodb://localhost:27017/excel-analytics';

async function inspectCharts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
    
    // Get direct access to the MongoDB collection
    const chartCollection = mongoose.connection.collection('charts');
    
    // Find all charts
    const charts = await chartCollection.find({}).toArray();
    
    if (charts.length === 0) {
      console.log('No charts found in the database');
      process.exit(0);
    }
    
    console.log(`Found ${charts.length} charts:`);
    
    // Print each chart's ID and detailed structure
    charts.forEach((chart, index) => {
      console.log(`\n${index + 1}. ID: ${chart._id}, Title: ${chart.title || 'No title'}`);
      
      // Check required fields
      console.log(`   Has data field: ${chart.data ? 'Yes' : 'No'}`);
      if (chart.data) {
        console.log(`   Data structure: labels: ${chart.data.labels ? 'Yes' : 'No'}, datasets: ${chart.data.datasets ? 'Yes' : 'No'}`);
      }
      
      console.log(`   Has type field: ${chart.type ? 'Yes' : 'No'}`);
      console.log(`   Has configuration field: ${chart.configuration ? 'Yes' : 'No'}`);
      
      // Check if any fields are null
      const nullFields = [];
      for (const [key, value] of Object.entries(chart)) {
        if (value === null) {
          nullFields.push(key);
        }
      }
      
      if (nullFields.length > 0) {
        console.log(`   Null fields: ${nullFields.join(', ')}`);
      }
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error inspecting charts:', error);
    process.exit(1);
  }
}

// Run the script
inspectCharts(); 