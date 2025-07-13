/**
 * Script to directly fix chart data using MongoDB driver
 * This bypasses Mongoose validation
 * 
 * Run this script with: node scripts/fixChart.js
 */

const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

// MongoDB URI - replace with your actual connection string
const MONGO_URI = 'mongodb://localhost:27017/excel-analytics';

// Chart ID to fix
const chartId = '681ce483a29ff553cad2b4de';

async function fixChart() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
    
    // Get direct access to the MongoDB collection
    const chartCollection = mongoose.connection.collection('charts');
    
    // Update the chart directly
    const result = await chartCollection.updateOne(
      { _id: new ObjectId(chartId) },
      { 
        $set: { 
          data: {
            labels: [],
            datasets: [],
            source: []
          }
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      console.error(`Chart with ID ${chartId} not found`);
      process.exit(1);
    }
    
    if (result.modifiedCount === 0) {
      console.log('Chart was found but no modifications were made (data field might already exist)');
    } else {
      console.log('Chart updated successfully with direct MongoDB update');
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing chart with direct update:', error);
    process.exit(1);
  }
}

// Run the fix
fixChart(); 