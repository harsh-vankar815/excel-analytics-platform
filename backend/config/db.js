const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    // Ensure proper encoding of special characters in the URI
    const uri = encodeURI(config.MONGO_URI);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000, // Timeout after 15 seconds instead of 10
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      connectTimeoutMS: 15000, // Give up initial connection after 15 seconds
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 50,
      minPoolSize: 10,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      if (err.name === 'MongoServerError' && err.code === 18) {
        console.error('Authentication failed. Please check your credentials.');
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (error.name === 'MongoServerError' && error.code === 18) {
      console.error('Authentication failed. Please check your MongoDB username and password.');
    }
    process.exit(1);
  }
};

module.exports = connectDB; 