const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');
const passport = require('passport');
const User = require('./models/User');
const session = require('express-session');
const fs = require('fs');
const config = require('./config/config');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/db');
connectDB();

// Create uploads directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/excel',
    './uploads/temp'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Create necessary upload directories
createUploadDirs();

// Initialize default roles and settings
const initializeDefaults = async () => {
  try {
    const Role = require('./models/Role');
    const SystemSettings = require('./models/SystemSettings');

    // Create default roles if they don't exist
    await Role.createDefaultRoles();

    // Initialize system settings if they don't exist
    await SystemSettings.getSettings();

    console.log('Default roles and settings initialized');
  } catch (error) {
    console.error('Error initializing defaults:', error);
  }
};

// Run initialization
initializeDefaults();

// Passport config
require('./config/passport');

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Route files
const authRoutes = require('./routes/auth');
const excelRoutes = require('./routes/excel');
const chartRoutes = require('./routes/chart');
const aiRoutes = require('./routes/ai');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

// Error handler
const errorHandler = require('./middleware/error');
const MongoStore = require('connect-mongo');

// Initialize app
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Express session
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // store: MongoStore.create({
    //   mongoUrl: process.env.MONGO_URI, // e.g., mongodb://localhost:27017/excel-analytics
    //   ttl: 14 * 24 * 60 * 60, // 14 days
    // }),
    cookie: {
      secure: config.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 300, // Increased from 100 to 300 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// Higher limit for chart API endpoints
const chartLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 500, // Higher limit for chart endpoints
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use(limiter);

// Enable CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://excel-analytics-platform-frontend.vercel.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/charts', chartLimiter, chartRoutes); // Apply chart-specific limiter
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Excel Analytics API' });
});

// Error handler middleware
app.use(errorHandler);

// Get port from env or use default
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 