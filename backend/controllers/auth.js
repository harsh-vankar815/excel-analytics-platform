const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { logActivity } = require('../middleware/logger');
const path = require('path');
const fs = require('fs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Log activity
    await logActivity(req, user, 'LOGIN', 'User logged in');

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if email exists
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${config.FRONTEND_URL}/reset-password/${resetToken}`;

    // Create email message
    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email from Excel Analytics because you (or someone else) has requested to reset your password.</p>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        service: config.EMAIL_SERVICE,
        auth: {
          user: config.EMAIL_USERNAME,
          pass: config.EMAIL_PASSWORD
        }
      });

      // Send email
      await transporter.sendMail({
        from: `${config.FROM_NAME} <${config.FROM_EMAIL}>`,
        to: user.email,
        subject: 'Password Reset Request',
        html: message
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent'
      });
    } catch (err) {
      console.error('Email error:', err);
      
      // If email fails, reset the token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get token from url and hash it
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    // Find user by token and check if token is valid
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Return success message
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google OAuth login
// @route   GET /api/auth/google
// @access  Public
exports.googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('Google OAuth callback error:', err);
      return res.redirect(`${config.FRONTEND_URL}/login?error=oauth_failed`);
    }
    
    if (!user) {
      console.error('Google authentication failed:', info);
      return res.redirect(`${config.FRONTEND_URL}/login?error=oauth_failed`);
    }
    
    // User authenticated successfully, create token
    const token = user.getSignedJwtToken();
    
    // Redirect to frontend with token
    res.redirect(`${config.FRONTEND_URL}/oauth/callback?token=${token}`);
  })(req, res, next);
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    // Log activity if user is available
    if (req.user) {
      await logActivity(req, req.user, 'LOGOUT', 'User logged out');
    }

    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + parseInt(config.JWT_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  // Use secure cookies in production
  if (config.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
};

// @desc    Admin login
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized as admin'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Register admin user (restricted)
// @route   POST /api/auth/admin/register
// @access  Private/Admin
exports.registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin'
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    let userData = {};
    
    // Fields that can be updated
    const allowedFields = ['name', 'email', 'bio'];
    
    // Handle JSON data (basic profile updates)
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        userData[field] = req.body[field];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(req.user.id, userData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
}; 