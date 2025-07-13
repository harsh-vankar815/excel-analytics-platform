const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  logout,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleCallback,
  adminLogin,
  registerAdmin,
  updateProfile
} = require('../controllers/auth');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Google OAuth routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// Admin routes
router.post('/admin/login', adminLogin);
router.post('/admin/register', protect, authorize('admin'), registerAdmin);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);

module.exports = router; 