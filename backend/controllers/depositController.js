import Deposit from '../models/Deposit.js';
import Setting from '../models/Setting.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';

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

// @desc    Submit a manual deposit request (UTR based)
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
      payment_method: 'manual',
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

// =====================================================================
// ZAPUPI AUTOMATIC PAYMENT
// =====================================================================

// @desc    Create a ZapUPI payment order (backend calls ZapUPI API)
// @route   POST /api/deposits/zapupi/create-order
// @access  Private
export const createZapUpiOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      res.status(400);
      throw new Error('Please provide a deposit amount');
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

    const zapKey = process.env.ZAPUPI_KEY;
    if (!zapKey) {
      res.status(500);
      throw new Error('ZapUPI payment gateway is not configured');
    }

    // Build a unique order ID prefixed with OTPADDAA_ to avoid conflict
    // with your other website using the same ZapUPI key
    const orderId = `OTPADDAA_${req.user.id}_${Date.now()}`;

    // Build the webhook URL from the BACKEND_URL env var
    const webhookUrl = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`}/api/deposits/zapupi/webhook`;
    
    // Build the redirect URL for after payment
    const redirectUrl = `${process.env.FRONTEND_URL || 'https://otpaddaa.shop'}/deposits`;

    // Call ZapUPI create-order API from the backend (key stays server-side)
    const response = await fetch('https://pay.zapupi.com/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        zap_key: zapKey,
        order_id: orderId,
        amount: String(numericAmount),
        remark: `Deposit | ${req.user.id}`,
        webhook_url: webhookUrl,
        redirect_url: redirectUrl,
      }),
    });

    const data = await response.json();

    if (data.status !== 'success' || !data.payment_url) {
      res.status(502);
      throw new Error(data.message || 'Failed to create payment order');
    }

    // Create a pending deposit record in DB immediately
    // Use orderId as UTR placeholder (will be updated by webhook)
    const deposit = await Deposit.create({
      userId: req.user.id,
      amount: numericAmount,
      utr: orderId, // placeholder until webhook fills real UTR
      status: 'pending',
      payment_method: 'zapupi',
      zapupi_order_id: orderId,
    });

    await AuditLog.create({
      action: 'ZAPUPI_ORDER_CREATED',
      details: { depositId: deposit._id, orderId, amount: numericAmount },
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      payment_url: data.payment_url,
      order_id: orderId,
      deposit_id: deposit._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    ZapUPI Webhook Receiver — called by ZapUPI when payment status changes
// @route   POST /api/deposits/zapupi/webhook
// @access  Public (no auth — called by ZapUPI server)
export const zapUpiWebhook = async (req, res) => {
  try {
    const { order_id, status, txn_id, amount, utr, environment } = req.body;

    // Only process orders created by THIS site (prefix check = no conflict with other websites)
    if (!order_id || !order_id.startsWith('OTPADDAA_')) {
      return res.status(200).json({ status: 'ok' }); // ignore other site orders
    }

    // Skip test environment webhooks in production
    if (environment === 'test') {
      return res.status(200).json({ status: 'ok' });
    }

    if (!status) {
      return res.status(200).json({ status: 'ok' });
    }

    // Find the pending deposit for this order
    const deposit = await Deposit.findOne({
      zapupi_order_id: order_id,
      payment_method: 'zapupi',
    });

    if (!deposit) {
      // Unknown order — still respond 200 so ZapUPI doesn't retry
      return res.status(200).json({ status: 'ok' });
    }

    // Prevent double-processing
    if (deposit.status !== 'pending') {
      return res.status(200).json({ status: 'ok' });
    }

    if (status.toLowerCase() === 'success') {
      // Double-confirm via order-status API before crediting balance
      const confirmResp = await fetch('https://pay.zapupi.com/api/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zap_key: process.env.ZAPUPI_KEY,
          order_id,
        }),
      });
      const confirmData = await confirmResp.json();

      if (
        confirmData.status.toLowerCase() !== 'success' ||
        !confirmData.data ||
        confirmData.data.status.toLowerCase() !== 'success'
      ) {
        console.warn(`[ZapUPI Webhook] Could not double-confirm order: ${order_id}`);
        return res.status(200).json({ status: 'ok' });
      }

      // Update deposit to approved
      deposit.status = 'approved';
      deposit.utr = utr || txn_id || order_id;
      deposit.zapupi_txn_id = txn_id || null;
      await deposit.save();

      // Credit user balance
      await User.findByIdAndUpdate(deposit.userId, {
        $inc: { balance: deposit.amount },
      });

      // Create transaction record
      await Transaction.create({
        userId: deposit.userId,
        amount: deposit.amount,
        type: 'deposit',
        description: `ZapUPI Auto Deposit - UTR ${utr || txn_id || 'N/A'}`,
        referenceId: String(deposit._id),
      });

      // Create audit log
      await AuditLog.create({
        action: 'ZAPUPI_DEPOSIT_AUTO_APPROVED',
        details: {
          depositId: deposit._id,
          orderId: order_id,
          txnId: txn_id,
          utr,
          amount: deposit.amount,
        },
        userId: deposit.userId,
      });
    } else if (status.toLowerCase() === 'failed') {
      deposit.status = 'rejected';
      deposit.zapupi_txn_id = txn_id || null;
      await deposit.save();

      await AuditLog.create({
        action: 'ZAPUPI_DEPOSIT_FAILED',
        details: { depositId: deposit._id, orderId: order_id, txnId: txn_id },
        userId: deposit.userId,
      });
    }

    // Always respond HTTP 200 + {status:'ok'} — ZapUPI will retry if not received
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[ZapUPI Webhook] Error:', error.message);
    return res.status(200).json({ status: 'ok' });
  }
};

// @desc    Check ZapUPI order status (frontend polls this after redirect)
// @route   GET /api/deposits/zapupi/status/:orderId
// @access  Private
export const checkZapUpiStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Only allow checking orders belonging to this user
    const deposit = await Deposit.findOne({
      zapupi_order_id: orderId,
      userId: req.user.id,
      payment_method: 'zapupi',
    });

    if (!deposit) {
      res.status(404);
      throw new Error('Order not found');
    }

    return res.status(200).json({
      success: true,
      status: deposit.status,
      amount: deposit.amount,
      createdAt: deposit.createdAt,
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
