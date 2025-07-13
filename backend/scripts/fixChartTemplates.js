/**
 * Script to fix chart templates missing the data field
 * 
 * Run this script with: node scripts/fixChartTemplates.js
 */

const mongoose = require('mongoose');

// MongoDB URI - replace with your actual connection string
const MONGO_URI = 'mongodb://localhost:27017/excel-analytics';

async function fixChartTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');
    
    // Get direct access to the MongoDB collections
    const chartCollection = mongoose.connection.collection('charts');
    const chartTemplateCollection = mongoose.connection.collection('charttemplates');
    
    // Find all chart templates
    const chartTemplates = await chartTemplateCollection.find({}).toArray();
    
    if (chartTemplates.length === 0) {
      console.log('No chart templates found in the database');
      
      // Check if there are any charts marked as templates
      const templateCharts = await chartCollection.find({ 
        $or: [
          { isTemplate: true },
          { isSavedTemplate: true }
        ]
      }).toArray();
      
      if (templateCharts.length > 0) {
        console.log(`Found ${templateCharts.length} charts marked as templates`);
        
        // Fix each template chart
        for (const chart of templateCharts) {
          console.log(`Checking template chart: ${chart._id}, Title: ${chart.title || chart.templateName || 'No title'}`);
          
          // Check if data field exists
          if (!chart.data) {
            console.log(`  Adding missing data field to chart ${chart._id}`);
            
            // Add default data structure
            const result = await chartCollection.updateOne(
              { _id: chart._id },
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
            
            if (result.modifiedCount === 1) {
              console.log(`  Successfully added data field to chart ${chart._id}`);
            } else {
              console.log(`  Failed to add data field to chart ${chart._id}`);
            }
          } else {
            console.log(`  Chart ${chart._id} already has data field`);
          }
        }
      } else {
        console.log('No charts marked as templates found');
      }
    } else {
      console.log(`Found ${chartTemplates.length} chart templates`);
      
      // Fix each template
      for (const template of chartTemplates) {
        console.log(`Checking template: ${template._id}, Title: ${template.title || template.templateName || 'No title'}`);
        
        // Check if data field exists
        if (!template.data) {
          console.log(`  Adding missing data field to template ${template._id}`);
          
          // Add default data structure
          const result = await chartTemplateCollection.updateOne(
            { _id: template._id },
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
          
          if (result.modifiedCount === 1) {
            console.log(`  Successfully added data field to template ${template._id}`);
          } else {
            console.log(`  Failed to add data field to template ${template._id}`);
          }
        } else {
          console.log(`  Template ${template._id} already has data field`);
        }
      }
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing chart templates:', error);
    process.exit(1);
  }
}

// Run the script
fixChartTemplates(); 