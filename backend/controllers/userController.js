import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Update user profile (username / password)
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { username, password } = req.body;

    if (username && username !== user.username) {
      // Check if username already taken
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        res.status(400);
        throw new Error('Username is already taken');
      }
      user.username = username;
    }

    if (password) {
      if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
      }
      user.password = password;
    }

    const updatedUser = await user.save();

    await AuditLog.create({
      action: 'USER_PROFILE_UPDATE',
      details: { username: updatedUser.username },
      userId: updatedUser._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        balance: updatedUser.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction history
// @route   GET /api/user/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100); // return last 100 transactions

    return res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};
