const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a role name'],
    unique: true,
    trim: true
  },
  description: {
    type: String
  },
  permissions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Middleware to set updatedAt whenever permissions change
RoleSchema.pre('save', function(next) {
  if (this.isModified('permissions')) {
    this.updatedAt = Date.now();
  }
  next();
});

// Create default roles if none exist
RoleSchema.statics.createDefaultRoles = async function() {
  const count = await this.countDocuments();
  
  if (count === 0) {
    await this.create([
      {
        name: 'Admin',
        description: 'Administrator with full access',
        permissions: {
          users: { view: true, create: true, edit: true, delete: true },
          content: { view: true, create: true, edit: true, delete: true, moderate: true },
          files: { upload: true, download: true, delete: true },
          analytics: { view: true, export: true },
          settings: { view: true, edit: true }
        },
        isDefault: true
      },
      {
        name: 'User',
        description: 'Standard user with limited access',
        permissions: {
          content: { view: true, create: true, edit: true, delete: true },
          files: { upload: true, download: true, delete: true },
          analytics: { view: true }
        },
        isDefault: true
      }
    ]);
    
    console.log('Default roles created');
  }
};

module.exports = mongoose.model('Role', RoleSchema); 