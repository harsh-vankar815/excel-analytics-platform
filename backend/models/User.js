const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Reference to Role model (for advanced permissions)
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  limits: {
    storageLimit: {
      type: Number,
      default: 500 // MB
    },
    fileLimit: {
      type: Number,
      default: 50
    },
    chartLimit: {
      type: Number,
      default: 100
    },
    currentStorageUsed: {
      type: Number,
      default: 0
    }
  },
  googleId: {
    type: String
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  // Hash password with strength 10
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check if password matches
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE }
  );
};

// Check if user has reached limits
UserSchema.methods.hasReachedLimits = function(type) {
  switch(type) {
    case 'file':
      return this.limits.fileLimit > 0 && this.limits.fileLimit <= this.fileCount;
    case 'chart':
      return this.limits.chartLimit > 0 && this.limits.chartLimit <= this.chartCount;
    case 'storage':
      return this.limits.storageLimit > 0 && this.limits.storageLimit <= this.limits.currentStorageUsed;
    default:
      return false;
  }
};

// Method to check if user has permission
UserSchema.methods.hasPermission = async function(category, permission) {
  if (this.role === 'admin') {
    return true; // Admin has all permissions
  }
  
  if (!this.roleId) {
    return false;
  }
  
  // Populate role if not populated
  if (!this.populated('roleId')) {
    await this.populate('roleId');
  }
  
  // Check permission
  return this.roleId && 
         this.roleId.permissions && 
         this.roleId.permissions[category] && 
         this.roleId.permissions[category][permission] === true;
};

module.exports = mongoose.model('User', UserSchema); 