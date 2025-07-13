const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getPlatformStats,
  getAllContent,
  updateContentStatus,
  deleteContent,
  updateUserLimits,
  getActivityLogs,
  getSystemSettings,
  updateSystemSettings,
  getUserRoles,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  updatePermissions
} = require('../controllers/admin');

// Apply auth middleware to all routes
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.route('/users').get(getUsers);
router.route('/users/roles').get(getUserRoles);
router.route('/users/:id').get(getUser).put(updateUser).delete(deleteUser);
router.route('/users/:id/limits').patch(updateUserLimits);
router.route('/users/:id/role').patch(updateUser);
router.route('/users/:id/status').patch(updateUser);

// Content management routes
router.route('/content').get(getAllContent);
router.route('/content/:contentId/status').patch(updateContentStatus);
router.route('/content/:contentId').delete(deleteContent);

// Statistics and activity routes
router.route('/stats').get(getPlatformStats);
router.route('/activity').get(getActivityLogs);

// System settings routes
router.route('/settings').get(getSystemSettings).put(updateSystemSettings);

// Role management routes
router.route('/roles').get(getRoles).post(createRole);
router.route('/roles/:id').put(updateRole).delete(deleteRole);
router.route('/roles/:id/permissions').put(updatePermissions);

module.exports = router;
