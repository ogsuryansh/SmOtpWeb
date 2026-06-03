import User from '../models/User.js';
import Deposit from '../models/Deposit.js';
import OTPOrder from '../models/OTPOrder.js';
import Transaction from '../models/Transaction.js';
import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';
import { sastaOtpService } from '../services/sastaOtpService.js';

// @desc    Get Admin Panel dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    // Total deposits (approved)
    const approvedDeposits = await Deposit.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDepositsVal = approvedDeposits[0]?.total || 0;

    // Pending deposits count
    const pendingDepositsCount = await Deposit.countDocuments({ status: 'pending' });

    // Total sales and revenue (profit from completed orders)
    const completedOrders = await OTPOrder.find({ status: 'completed' });
    const totalSales = completedOrders.reduce((sum, order) => sum + order.price, 0);
    const totalCost = completedOrders.reduce((sum, order) => sum + order.apiPrice, 0);
    const totalRevenueVal = parseFloat((totalSales - totalCost).toFixed(2)); // Profit from markups

    // OTP Orders Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = await OTPOrder.countDocuments({ createdAt: { $gte: today } });

    // API Balance
    const apiBalanceInfo = await sastaOtpService.getBalance();
    const apiBalance = apiBalanceInfo && !apiBalanceInfo.error ? apiBalanceInfo.balance : 0;

    // Completed, pending, and failed orders overall
    const completedOrdersCount = await OTPOrder.countDocuments({ status: 'completed' });
    const pendingOrdersCount = await OTPOrder.countDocuments({ status: 'pending' });
    const failedOrdersCount = await OTPOrder.countDocuments({ status: { $in: ['cancelled', 'expired'] } });

    // Recent 10 audit logs
    const recentAuditLogs = await AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'username email');

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        bannedUsers,
        totalDeposits: totalDepositsVal,
        pendingDeposits: pendingDepositsCount,
        totalRevenue: totalRevenueVal,
        totalSales,
        ordersToday,
        apiBalance,
        ordersCount: {
          completed: completedOrdersCount,
          pending: pendingOrdersCount,
          failed: failedOrdersCount
        }
      },
      recentLogs: recentAuditLogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details (ban, change role, adjust balance)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { isBanned, role, adjustBalance, remark } = req.body;

    if (isBanned !== undefined) {
      user.isBanned = isBanned;
      await AuditLog.create({
        action: isBanned ? 'USER_BANNED' : 'USER_UNBANNED',
        details: { userId: user._id, remark: remark || '' },
        userId: req.user.id
      });
    }

    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }

    if (adjustBalance !== undefined && adjustBalance !== 0) {
      const adjustmentAmount = parseFloat(adjustBalance);
      if (!isNaN(adjustmentAmount)) {
        user.balance = parseFloat((user.balance + adjustmentAmount).toFixed(2));
        
        if (user.balance < 0) {
          res.status(400);
          throw new Error('Balance cannot be adjusted to a negative value');
        }

        await Transaction.create({
          userId: user._id,
          amount: adjustmentAmount,
          type: 'admin_adjustment',
          description: `Admin adjustment: ${adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount} INR. Reason: ${remark || 'Admin modification'}`,
        });

        await AuditLog.create({
          action: 'USER_BALANCE_ADJUST',
          details: { userId: user._id, amount: adjustmentAmount, remark: remark || '' },
          userId: req.user.id
        });
      }
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all manual deposit requests
// @route   GET /api/admin/deposits
// @access  Private/Admin
export const getDeposits = async (req, res, next) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }

    const deposits = await Deposit.find(query)
      .populate('userId', 'username email')
      .populate('processedBy', 'username')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      deposits,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject deposit request
// @route   PUT /api/admin/deposits/:id
// @access  Private/Admin
export const processDeposit = async (req, res, next) => {
  try {
    const { status, remarks } = req.body; // status: 'approved' or 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status. Must be approved or rejected');
    }

    const deposit = await Deposit.findById(req.params.id);
    if (!deposit) {
      res.status(404);
      throw new Error('Deposit request not found');
    }

    if (deposit.status !== 'pending') {
      res.status(400);
      throw new Error(`Deposit has already been ${deposit.status}`);
    }

    deposit.status = status;
    deposit.remarks = remarks || '';
    deposit.processedBy = req.user.id;
    deposit.processedAt = new Date();

    if (status === 'approved') {
      // Add balance to user
      const user = await User.findById(deposit.userId);
      if (!user) {
        res.status(404);
        throw new Error('User who requested this deposit no longer exists');
      }

      user.balance = parseFloat((user.balance + deposit.amount).toFixed(2));
      await user.save();

      // Log transaction
      await Transaction.create({
        userId: user._id,
        amount: deposit.amount,
        type: 'deposit',
        description: `Manual Deposit Approved - UTR ${deposit.utr}`,
        referenceId: deposit._id,
      });

      await AuditLog.create({
        action: 'DEPOSIT_APPROVED',
        details: { depositId: deposit._id, userId: user._id, amount: deposit.amount },
        userId: req.user.id
      });
    } else {
      await AuditLog.create({
        action: 'DEPOSIT_REJECTED',
        details: { depositId: deposit._id, userId: deposit.userId, remarks },
        userId: req.user.id
      });
    }

    await deposit.save();

    return res.status(200).json({
      success: true,
      message: `Deposit request ${status} successfully`,
      deposit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all OTP orders across site
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getOTPOrders = async (req, res, next) => {
  try {
    const orders = await OTPOrder.find({})
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .limit(200); // Return top 200 orders

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
export const getSettings = async (req, res, next) => {
  try {
    const settings = await Setting.find({});
    // Format settings as key-value map for client convenience
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return res.status(200).json({
      success: true,
      settings: settingsMap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body; // e.g. { siteName: "MyOtp", markupPercentage: 15 }

    for (const key in updates) {
      await Setting.findOneAndUpdate(
        { key },
        { value: updates[key] },
        { upsert: true }
      );
    }

    await AuditLog.create({
      action: 'SETTINGS_UPDATE',
      details: updates,
      userId: req.user.id,
    });

    // Return fresh list
    const settings = await Setting.find({});
    const settingsMap = {};
    settings.forEach(s => {
      settingsMap[s.key] = s.value;
    });

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: settingsMap,
    });
  } catch (error) {
    next(error);
  }
};
