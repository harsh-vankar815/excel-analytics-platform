/**
 * Script to list all charts in the database
 * 
 * Run this script with: node scripts/listCharts.js
 */

const mongoose = require('mongoose');

// MongoDB URI - replace with your actual connection string
const MONGO_URI = 'mongodb://localhost:27017/excel-analytics';

async function listCharts() {
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
    
    // Print each chart's ID and title
    charts.forEach((chart, index) => {
      console.log(`${index + 1}. ID: ${chart._id}, Title: ${chart.title || 'No title'}`);
      // Check if data field exists
      console.log(`   Has data field: ${chart.data ? 'Yes' : 'No'}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error listing charts:', error);
    process.exit(1);
  }
}

// Run the script
listCharts(); 