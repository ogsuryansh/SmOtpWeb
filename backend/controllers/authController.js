import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforotpmarketplace123!@#', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please enter all fields');
    }

    // Check if user exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email is already registered');
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      res.status(400);
      throw new Error('Username is already taken');
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      // Log audit
      await AuditLog.create({
        action: 'USER_REGISTER',
        details: { email: user.email, username: user.username },
        userId: user._id,
      });

      return res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          balance: user.balance,
        },
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      res.status(400);
      throw new Error('Please enter credentials');
    }

    // Find by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).select('+password');

    if (!user) {
      res.status(401);
      throw new Error('Invalid email/username or password');
    }

    // Check ban status
    if (user.isBanned) {
      res.status(403);
      throw new Error('Your account has been banned. Please contact support.');
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email/username or password');
    }

    // Log audit
    await AuditLog.create({
      action: 'USER_LOGIN',
      details: { ip: req.ip || '' },
      userId: user._id,
    });

    return res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Please provide an email address');
    }

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists or not, but return success
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been generated.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to database fields
    user.forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire (10 minutes)
    user.forgotPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL
    const host = req.headers.host || 'localhost:5173';
    const protocol = req.secure ? 'https' : 'http';
    // Vite Dev Server runs on 5173 by default, backend is 5000. So let's link to frontend reset path.
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Log to console for direct copy-paste (perfect for dev environment!)
    console.log('\n====================================');
    console.log(`PASSWORD RESET REQUEST FOR: ${email}`);
    console.log(`Reset Token: ${resetToken}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('====================================\n');

    await AuditLog.create({
      action: 'PASSWORD_RESET_REQUEST',
      details: { email: user.email, resetToken },
      userId: user._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset link generated. Check server console logs for URL.',
      resetToken, // Return for easier frontend integration/development test
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      res.status(400);
      throw new Error('Please provide a new password');
    }

    // Hash token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      forgotPasswordToken: tokenHash,
      forgotPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    // Set new password
    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpire = undefined;

    await user.save();

    await AuditLog.create({
      action: 'PASSWORD_RESET_SUCCESS',
      details: { email: user.email },
      userId: user._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login.',
    });
  } catch (error) {
    next(error);
  }
};
