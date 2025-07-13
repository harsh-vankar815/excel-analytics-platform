const User = require('../models/User');
const ExcelFile = require('../models/ExcelFile');
const Chart = require('../models/Chart');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific user
// @route   GET /api/admin/users/:id
// @access  Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get file and chart counts for this user
    const fileCount = await ExcelFile.countDocuments({ uploadedBy: user._id });
    const chartCount = await Chart.countDocuments({ createdBy: user._id });

    // Add counts to user data
    const userData = user.toObject();
    userData.fileCount = fileCount;
    userData.chartCount = chartCount;

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Allow role updates through this endpoint, but validate the values
    if (req.body.role && req.body.role !== 'user' && req.body.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow admins to delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Admins cannot delete their own account through this endpoint'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Admin
exports.getPlatformStats = async (req, res, next) => {
  try {
    const { timeRange = 'week' } = req.query;
    const ActivityLog = require('../models/ActivityLog');
    
    // Get total user count
    const userCount = await User.countDocuments();
    
    // Get user registration stats by month
    const userRegistrations = await User.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }
    ]);

    // Get total file count
    const fileCount = await ExcelFile.countDocuments();
    
    // Get total chart count
    const chartCount = await Chart.countDocuments();
    
    // Get most viewed charts
    const popularCharts = await Chart.find()
      .sort({ viewCount: -1 })
      .limit(5)
      .populate('createdBy', 'name email');
    
    // Get most viewed files
    const popularFiles = await ExcelFile.find()
      .sort({ viewCount: -1 })
      .limit(5)
      .populate('uploadedBy', 'name email');
    
    // Get newest users
    const newestUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
      
    // Get recent activity logs
    const recentActivity = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(10);
      
    // Map activity logs to a format suitable for the frontend
    const formattedActivity = recentActivity.map(activity => ({
      user: {
        name: activity.user ? activity.user.name : 'Unknown User',
        email: activity.user ? activity.user.email : 'unknown@example.com'
      },
      action: activity.action.toLowerCase().replace('_', ' '),
      resource: {
        type: activity.action.includes('FILE') ? 'File' : 
              activity.action.includes('CHART') ? 'Chart' : 
              activity.action.includes('USER') ? 'User' : 'System',
        id: activity.details.split(' ').pop()
      },
      timestamp: activity.timestamp.toLocaleString()
    }));
    
    // Get data for activity chart
    let activityTimeFilter = {};
    const now = new Date();
    
    // Set the time range filter based on the timeRange parameter
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      activityTimeFilter = { timestamp: { $gte: weekAgo } };
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      activityTimeFilter = { timestamp: { $gte: monthAgo } };
    } else if (timeRange === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      activityTimeFilter = { timestamp: { $gte: yearAgo } };
    }
    
    // Get activity data for chart
    const activityChart = await ActivityLog.aggregate([
      { $match: activityTimeFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            action: "$action"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.date": 1 } }
    ]);
    
    // Add some sample data if no activity exists or if in development mode
    const isDataMissing = activityChart.length === 0;
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    if (isDataMissing || isDevelopment) {
      console.log('Generating sample activity data for the admin dashboard');
      
      // Number of days to generate based on timeRange
      let daysToGenerate = 7;
      if (timeRange === 'month') daysToGenerate = 30;
      else if (timeRange === 'year') daysToGenerate = 30; // Just a sample of the year
      
      // Generate activities for the specified number of days
      for (let i = daysToGenerate - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        // Check if we already have data for this date
        const existingEntries = activityChart.filter(item => 
          item._id && item._id.date === dateString
        );
        
        // Only add sample data if we don't have real data for this date
        if (existingEntries.length === 0) {
          // Add login activity (more common)
          activityChart.push({
            _id: { date: dateString, action: 'LOGIN' },
            count: Math.floor(Math.random() * 5) + 1
          });
          
          // Add file upload activity (less common)
          if (i % 2 === 0 || Math.random() > 0.7) {
            activityChart.push({
              _id: { date: dateString, action: 'UPLOAD_FILE' },
              count: Math.floor(Math.random() * 3) + 1
            });
          }
          
          // Add chart creation activity (least common)
          if (i % 3 === 0 || Math.random() > 0.8) {
            activityChart.push({
              _id: { date: dateString, action: 'CREATE_CHART' },
              count: Math.floor(Math.random() * 2) + 1
            });
          }
        }
      }
    }
    
    // Calculate active users (users who logged in within the last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activeUsersLogs = await ActivityLog.distinct('user', { 
      action: 'LOGIN',
      timestamp: { $gte: thirtyDaysAgo }
    });
    const activeUsers = activeUsersLogs.length;
    
    // Calculate growth percentages (simplified calculation)
    const userGrowth = Math.round((newestUsers.length / userCount) * 100);
    const fileGrowth = Math.round((popularFiles.length / (fileCount || 1)) * 100);
    const activeGrowth = Math.round((activeUsers / (userCount || 1)) * 100);

    res.status(200).json({
      success: true,
      data: {
        userCount,
        fileCount,
        chartCount,
        activeUsers,
        userGrowth,
        fileGrowth,
        activeGrowth,
        userRegistrations,
        popularCharts,
        popularFiles,
        newestUsers,
        recentActivity: formattedActivity,
        activityChart
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all content (excel files and charts)
// @route   GET /api/admin/content
// @access  Admin
exports.getAllContent = async (req, res, next) => {
  try {
    const { sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10, contentType, status } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    
    let filesQuery = {};
    let chartsQuery = {};
    
    if (status) {
      filesQuery.status = status;
      chartsQuery.status = status;
    }
    
    let result = [];
    let total = 0;
    
    if (!contentType || contentType === 'files') {
      const files = await ExcelFile.find(filesQuery)
        .sort(sort)
        .skip(contentType ? 0 : skip)
        .limit(contentType ? 1000 : parseInt(limit))
        .populate('uploadedBy', 'name email');
        
      result = [...result, ...files.map(file => ({
        ...file._doc,
        contentType: 'file',
        user: file.uploadedBy // Ensure user details are properly mapped
      }))];
      
      total += await ExcelFile.countDocuments(filesQuery);
    }
    
    if (!contentType || contentType === 'charts') {
      const charts = await Chart.find(chartsQuery)
        .sort(sort)
        .skip(contentType ? 0 : skip)
        .limit(contentType ? 1000 : parseInt(limit))
        .populate('createdBy', 'name email');
        
      result = [...result, ...charts.map(chart => ({
        ...chart._doc,
        contentType: 'chart',
        user: chart.createdBy // Ensure user details are properly mapped
      }))];
      
      total += await Chart.countDocuments(chartsQuery);
    }
    
    // Re-sort combined results if we fetched both types
    if (!contentType) {
      result = result.sort((a, b) => {
        if (sortOrder === 'desc') {
          return new Date(b[sortBy]) - new Date(a[sortBy]);
        } else {
          return new Date(a[sortBy]) - new Date(b[sortBy]);
        }
      }).slice(0, parseInt(limit));
    }
    
    res.status(200).json({
      success: true,
      count: total,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update content status (for moderation)
// @route   PATCH /api/admin/content/:id/status
// @access  Admin
exports.updateContentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, contentType } = req.body;
    
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided'
      });
    }
    
    if (!contentType || !['file', 'chart'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Content type must be specified'
      });
    }
    
    let content;
    
    if (contentType === 'file') {
      content = await ExcelFile.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('uploadedBy', 'name email');
      
      if (content) {
        content = content.toObject();
        content.user = content.uploadedBy;
      }
    } else {
      content = await Chart.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('createdBy', 'name email');
      
      if (content) {
        content = content.toObject();
        content.user = content.createdBy;
      }
    }
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete content (file or chart)
// @route   DELETE /api/admin/content/:id
// @access  Admin
exports.deleteContent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { contentType } = req.query;
    
    if (!contentType || !['file', 'chart'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Content type must be specified'
      });
    }
    
    let content;
    
    if (contentType === 'file') {
      content = await ExcelFile.findById(id);
    } else {
      content = await Chart.findById(id);
    }
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }
    
    await content.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user storage limits
// @route   PATCH /api/admin/users/:id/limits
// @access  Admin
exports.updateUserLimits = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { storageLimit, fileLimit, chartLimit } = req.body;
    
    const updateData = {};
    
    if (storageLimit !== undefined) updateData['limits.storageLimit'] = storageLimit;
    if (fileLimit !== undefined) updateData['limits.fileLimit'] = fileLimit;
    if (chartLimit !== undefined) updateData['limits.chartLimit'] = chartLimit;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get activity logs
// @route   GET /api/admin/activity
// @access  Admin
exports.getActivityLogs = async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      search, 
      page = 1, 
      limit = 20, 
      action,
      user
    } = req.query;
    
    const query = {};
    
    // User filter
    if (user && user !== 'undefined') {
      query.user = user;
    }
    
    // Date range filter with validation
    if (startDate && startDate !== 'undefined' && endDate && endDate !== 'undefined') {
      const validStartDate = new Date(startDate);
      const validEndDate = new Date(endDate);
      
      // Check if dates are valid
      if (!isNaN(validStartDate.getTime()) && !isNaN(validEndDate.getTime())) {
        query.timestamp = {
          $gte: validStartDate,
          $lte: validEndDate
        };
      }
    } else if (startDate && startDate !== 'undefined') {
      const validStartDate = new Date(startDate);
      if (!isNaN(validStartDate.getTime())) {
        query.timestamp = { $gte: validStartDate };
      }
    } else if (endDate && endDate !== 'undefined') {
      const validEndDate = new Date(endDate);
      if (!isNaN(validEndDate.getTime())) {
        query.timestamp = { $lte: validEndDate };
      }
    }
    
    // Action filter
    if (action && action !== 'all' && action !== 'undefined') {
      query.action = action;
    }
    
    // Text search
    if (search && search !== 'undefined') {
      query.$or = [
        { details: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const ActivityLog = require('../models/ActivityLog');
    
    // Get total count for pagination
    const total = await ActivityLog.countDocuments(query);
    
    // Fetch activity logs
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: total,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Admin
exports.getSystemSettings = async (req, res, next) => {
  try {
    const SystemSettings = require('../models/SystemSettings');
    const settings = await SystemSettings.getSettings();
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Admin
exports.updateSystemSettings = async (req, res, next) => {
  try {
    const SystemSettings = require('../models/SystemSettings');
    const { logActivity } = require('../middleware/logger');
    
    // Extract settings from request body
    const {
      defaultStorageLimit,
      defaultFileLimit,
      defaultChartLimit,
      contentModerationEnabled,
      autoApproveUploads,
      fileUploadSizeLimit,
      allowedFileExtensions,
      maintenanceMode
    } = req.body;
    
    // Get current settings
    let settings = await SystemSettings.getSettings();
    
    // Update settings
    settings.defaultStorageLimit = defaultStorageLimit || settings.defaultStorageLimit;
    settings.defaultFileLimit = defaultFileLimit || settings.defaultFileLimit;
    settings.defaultChartLimit = defaultChartLimit || settings.defaultChartLimit;
    settings.contentModerationEnabled = contentModerationEnabled !== undefined ? contentModerationEnabled : settings.contentModerationEnabled;
    settings.autoApproveUploads = autoApproveUploads !== undefined ? autoApproveUploads : settings.autoApproveUploads;
    settings.fileUploadSizeLimit = fileUploadSizeLimit || settings.fileUploadSizeLimit;
    settings.allowedFileExtensions = allowedFileExtensions || settings.allowedFileExtensions;
    settings.maintenanceMode = maintenanceMode !== undefined ? maintenanceMode : settings.maintenanceMode;
    settings.lastUpdated = Date.now();
    settings.updatedBy = req.user._id;
    
    await settings.save();
    
    // Log activity
    await logActivity(
      req, 
      req.user, 
      'SETTINGS_UPDATE', 
      'System settings updated'
    );
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available user roles
// @route   GET /api/admin/users/roles
// @access  Admin
exports.getUserRoles = async (req, res) => {
  try {
    // You can customize this list based on your application's needs
    const availableRoles = ['user', 'admin'];
    
    res.status(200).json({
      success: true,
      data: availableRoles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user roles'
    });
  }
};

// @desc    Get all roles
// @route   GET /api/admin/roles
// @access  Admin
exports.getRoles = async (req, res, next) => {
  try {
    const Role = require('../models/Role');
    
    // Initialize default roles if needed
    await Role.createDefaultRoles();
    
    const roles = await Role.find().sort('name');
    
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new role
// @route   POST /api/admin/roles
// @access  Admin
exports.createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;
    const Role = require('../models/Role');
    const { logActivity } = require('../middleware/logger');
    
    // Check if role with name already exists
    const existingRole = await Role.findOne({ name: name.trim() });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }
    
    // Create role
    const role = await Role.create({
      name: name.trim(),
      description,
      permissions: permissions || {},
      createdBy: req.user._id
    });
    
    // Log activity
    await logActivity(
      req, 
      req.user, 
      'ROLE_CREATE', 
      `Created new role: ${name.trim()}`
    );
    
    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update role
// @route   PUT /api/admin/roles/:id
// @access  Admin
exports.updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const Role = require('../models/Role');
    const { logActivity } = require('../middleware/logger');
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if role with name already exists (except this one)
    if (name && name !== role.name) {
      const existingRole = await Role.findOne({ 
        name: name.trim(),
        _id: { $ne: id }
      });
      
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'Role with this name already exists'
        });
      }
    }
    
    // Update role
    if (name) role.name = name.trim();
    if (description !== undefined) role.description = description;
    role.updatedAt = Date.now();
    role.updatedBy = req.user._id;
    
    await role.save();
    
    // Log activity
    await logActivity(
      req, 
      req.user, 
      'ROLE_UPDATE', 
      `Updated role: ${role.name}`
    );
    
    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete role
// @route   DELETE /api/admin/roles/:id
// @access  Admin
exports.deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const Role = require('../models/Role');
    const User = require('../models/User');
    const { logActivity } = require('../middleware/logger');
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if it's a default role
    if (role.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a default role'
      });
    }
    
    // Check if any users are using this role
    const usersWithRole = await User.countDocuments({ roleId: id });
    if (usersWithRole > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role: ${usersWithRole} users are assigned to this role`
      });
    }
    
    // Delete role
    await role.deleteOne();
    
    // Log activity
    await logActivity(
      req, 
      req.user, 
      'ROLE_DELETE', 
      `Deleted role: ${role.name}`
    );
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update role permissions
// @route   PUT /api/admin/roles/:id/permissions
// @access  Admin
exports.updatePermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const Role = require('../models/Role');
    const { logActivity } = require('../middleware/logger');
    
    // Find role
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Update permissions
    role.permissions = permissions;
    role.updatedAt = Date.now();
    role.updatedBy = req.user._id;
    
    await role.save();
    
    // Log activity
    await logActivity(
      req, 
      req.user, 
      'PERMISSION_UPDATE', 
      `Updated permissions for role: ${role.name}`
    );
    
    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
}; 