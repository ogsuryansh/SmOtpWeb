import Deposit from '../models/Deposit.js';
import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get payment settings details (QR Code, UPI ID, Min Deposit) for users
// @route   GET /api/deposits/payment-details
// @access  Private
export const getPaymentDetails = async (req, res, next) => {
  try {
    const upiIdSetting = await Setting.findOne({ key: 'paymentUpiId' });
    const qrCodeSetting = await Setting.findOne({ key: 'paymentQrCode' });
    const minDepositSetting = await Setting.findOne({ key: 'minDeposit' });

    return res.status(200).json({
      success: true,
      paymentUpiId: upiIdSetting ? upiIdSetting.value : 'pay@upi',
      paymentQrCode: qrCodeSetting ? qrCodeSetting.value : '',
      minDeposit: minDepositSetting ? parseFloat(minDepositSetting.value) : 10,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a manual deposit request
// @route   POST /api/deposits
// @access  Private
export const createDepositRequest = async (req, res, next) => {
  try {
    const { amount, utr } = req.body;

    if (!amount || !utr) {
      res.status(400);
      throw new Error('Please provide deposit amount and UTR / Transaction ID');
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      res.status(400);
      throw new Error('Please enter a valid positive deposit amount');
    }

    // Validate against system minimum deposit setting
    const minDepositSetting = await Setting.findOne({ key: 'minDeposit' });
    const minAmount = minDepositSetting ? parseFloat(minDepositSetting.value) : 10;
    if (numericAmount < minAmount) {
      res.status(400);
      throw new Error(`Minimum deposit amount is INR ${minAmount}`);
    }

    // Check if UTR already exists
    const utrExists = await Deposit.findOne({ utr: utr.trim() });
    if (utrExists) {
      res.status(400);
      throw new Error('A deposit request with this UTR has already been submitted');
    }

    // Create deposit request
    const screenshotPath = req.file ? `/uploads/${req.file.filename}` : '';

    const deposit = await Deposit.create({
      userId: req.user.id,
      amount: numericAmount,
      utr: utr.trim(),
      screenshot: screenshotPath,
    });

    await AuditLog.create({
      action: 'DEPOSIT_REQUEST_SUBMIT',
      details: { depositId: deposit._id, amount: deposit.amount, utr: deposit.utr },
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Deposit request submitted successfully. Waiting for admin approval.',
      deposit,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's deposit requests
// @route   GET /api/deposits
// @access  Private
export const getDeposits = async (req, res, next) => {
  try {
    const deposits = await Deposit.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      deposits,
    });
  } catch (error) {
    next(error);
  }
};
