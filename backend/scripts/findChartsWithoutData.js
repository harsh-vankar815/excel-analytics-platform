/**
 * Script to find charts without the data field
 * 
 * Run this script with: node scripts/findChartsWithoutData.js
 */

const mongoose = require('mongoose');

// MongoDB URI - replace with your actual connection string
const MONGO_URI = 'mongodb://localhost:27017/excel-analytics';

async function findChartsWithoutData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
    
    // Get direct access to the MongoDB collection
    const chartCollection = mongoose.connection.collection('charts');
    
    // Find charts without data field
    const chartsWithoutData = await chartCollection.find({ data: { $exists: false } }).toArray();
    
    if (chartsWithoutData.length === 0) {
      console.log('No charts found without data field');
    } else {
      console.log(`Found ${chartsWithoutData.length} charts without data field:`);
      
      // Print each chart's ID and title
      chartsWithoutData.forEach((chart, index) => {
        console.log(`${index + 1}. ID: ${chart._id}, Title: ${chart.title || 'No title'}`);
      });
      
      // Ask if we should fix these charts
      console.log('\nWould you like to fix these charts? (y/n)');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error finding charts without data:', error);
    process.exit(1);
  }
}

// Run the script
findChartsWithoutData(); 