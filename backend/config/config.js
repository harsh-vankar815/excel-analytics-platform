require('dotenv').config();

const config = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/excelanalytics',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET || 'session_secret_key_change_in_production',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@excelanalytics.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};

module.exports = config; 