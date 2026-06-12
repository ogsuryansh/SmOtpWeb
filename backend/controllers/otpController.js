import OTPOrder from '../models/OTPOrder.js';
import User from '../models/User.js';
import Setting from '../models/Setting.js';
import Transaction from '../models/Transaction.js';
import AuditLog from '../models/AuditLog.js';
import { sastaOtpService } from '../services/sastaOtpService.js';

// Helper to get system markup
async function getMarkupPercentage() {
  const setting = await Setting.findOne({ key: 'markupPercentage' });
  return setting ? parseFloat(setting.value) : 20; // Default 20%
}

// @desc    Get services list with local markup applied
// @route   GET /api/otp/services
// @access  Private
export const getServices = async (req, res, next) => {
  try {
    const { service } = req.query;
    const markup = await getMarkupPercentage();
    
    const apiData = await sastaOtpService.getServicesList(service);

    if (apiData.status !== 'OK') {
      res.status(500);
      throw new Error(apiData.message || 'Failed to fetch services from provider');
    }

    // Apply markup to services (DEEP CLONE to avoid mutating cache)
    const services = JSON.parse(JSON.stringify(apiData.services));
    for (const key in services) {
      const srv = services[key];
      // Apply to main price
      srv.price = parseFloat((srv.price * (1 + markup / 100)).toFixed(2));
      
      // Apply to individual country prices
      if (srv.countries && Array.isArray(srv.countries)) {
        srv.countries = srv.countries.map(country => ({
          ...country,
          price: parseFloat((country.price * (1 + markup / 100)).toFixed(2))
        }));
      }
    }

    const multiplierSetting = await Setting.findOne({ key: 'multiSmsMultiplier' });
    const multiSmsMultiplier = multiplierSetting ? parseFloat(multiplierSetting.value) : 2;

    return res.status(200).json({
      success: true,
      services,
      isMock: apiData.isMock || false,
      multiSmsMultiplier,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get supported countries
// @route   GET /api/otp/countries
// @access  Private
export const getCountries = async (req, res, next) => {
  try {
    const countriesData = await sastaOtpService.getCountries();
    return res.status(200).json({
      success: true,
      ...countriesData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Buy a phone number
// @route   POST /api/otp/buy
// @access  Private
export const buyNumber = async (req, res, next) => {
  try {
    const { serviceCode, countryCode, multiSms } = req.body;

    if (!serviceCode) {
      res.status(400);
      throw new Error('Please select a service');
    }

    const cCode = countryCode || '91';

    // 1. Fetch original service price
    const apiData = await sastaOtpService.getServicesList(serviceCode);
    if (apiData.status !== 'OK' || !apiData.services[serviceCode]) {
      res.status(400);
      throw new Error('Selected service is currently unavailable');
    }

    const serviceInfo = apiData.services[serviceCode];
    const countryConfig = serviceInfo.countries.find(c => c.country_code === cCode);
    
    if (!countryConfig) {
      res.status(400);
      throw new Error('Service is not available in the selected country');
    }

    if (countryConfig.qty <= 0) {
      res.status(400);
      throw new Error('No virtual numbers left in stock for this country');
    }

    const apiPrice = countryConfig.price;
    const markup = await getMarkupPercentage();
    let finalPrice = parseFloat((apiPrice * (1 + markup / 100)).toFixed(2));

    if (multiSms) {
      const multiplierSetting = await Setting.findOne({ key: 'multiSmsMultiplier' });
      const multiSmsMultiplier = multiplierSetting ? parseFloat(multiplierSetting.value) : 2;
      finalPrice = parseFloat((finalPrice * multiSmsMultiplier).toFixed(2));
    }

    // 2. Atomic Balance Check & Reservation
    // We deduct the balance immediately to prevent double spending.
    // If the API call fails, we restore/refund the reserved balance.
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, balance: { $gte: finalPrice } },
      { $inc: { balance: -finalPrice } },
      { new: true }
    );

    if (!user) {
      res.status(400);
      throw new Error('Insufficient wallet balance. Please deposit funds.');
    }

    // 3. Request number from SastaOTP
    let apiResponse;
    try {
      apiResponse = await sastaOtpService.getNumber(serviceCode, cCode, null, !!multiSms);
      
      if (!apiResponse || (!apiResponse.number && !apiResponse.phoneNumber && !apiResponse.phone && !apiResponse.activation_id)) {
        throw new Error('NO_NUMBERS');
      }
    } catch (apiError) {
      // Rollback user balance
      await User.findByIdAndUpdate(req.user.id, { $inc: { balance: finalPrice } });
      
      res.status(400);
      throw new Error('This country or service is not available, try something else');
    }

    // 4. Create Order & Log transaction
    let order;
    try {
      const expiresSec = apiResponse.expires_in || 1200;
      const expiresAt = new Date(Date.now() + expiresSec * 1000);

      order = await OTPOrder.create({
        userId: req.user.id,
        activationId: apiResponse.activation_id || apiResponse.activationId,
        phoneNumber: apiResponse.number || apiResponse.phoneNumber || apiResponse.phone,
        service: apiResponse.service || serviceInfo.name || serviceCode,
        serviceCode: serviceCode,
        country: apiResponse.country || countryConfig.country_name || cCode,
        countryCode: cCode,
        price: finalPrice,
        apiPrice: apiPrice,
        status: 'pending',
        multiSms: apiResponse.multi_sms || apiResponse.multiSms || false,
        expiresAt: expiresAt,
      });

      const transaction = await Transaction.create({
        userId: req.user.id,
        amount: -finalPrice,
        type: 'purchase',
        description: `Purchase number ${apiResponse.number} for ${apiResponse.service}`,
        referenceId: order._id,
      });

      await AuditLog.create({
        action: 'OTP_BUY_SUCCESS',
        details: { orderId: order._id, activationId: order.activationId, price: finalPrice },
        userId: req.user.id,
      });

      return res.status(201).json({
        success: true,
        message: 'Number purchased successfully',
        order,
      });
    } catch (dbError) {
      // Rollback user balance
      await User.findByIdAndUpdate(req.user.id, { $inc: { balance: finalPrice } });
      
      // Attempt to cancel the number on SastaOTP
      if (apiResponse && apiResponse.activation_id) {
        try {
          await sastaOtpService.setStatus(apiResponse.activation_id, -1);
        } catch (cancelErr) {
          console.warn('Failed to cancel on provider side after DB error:', cancelErr.message);
        }
      }

      res.status(500);
      throw new Error(`This country or service is not available, try something else`);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Poll/Get individual OTP order status
// @route   GET /api/otp/order/:id
// @access  Private
export const pollOrder = async (req, res, next) => {
  try {
    const order = await OTPOrder.findOne({ _id: req.params.id, userId: req.user.id });

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      return res.status(200).json({ success: true, order });
    }

    // Check if local expiration is reached
    if (new Date() > order.expiresAt) {
      // Update local state to expired atomically
      const updatedOrder = await OTPOrder.findOneAndUpdate(
        { _id: order._id, status: 'pending' },
        { status: 'expired' },
        { new: true }
      );

      if (!updatedOrder) return res.status(200).json({ success: true, order }); // already processed

      // Attempt to tell provider
      try {
        await sastaOtpService.setStatus(order.activationId, -1);
      } catch (err) {
        console.warn('Could not cancel on provider side:', err.message);
      }

      // Refund user only if no OTP was ever received
      if (!updatedOrder.hasReceivedOtp) {
        await User.findByIdAndUpdate(updatedOrder.userId, { $inc: { balance: updatedOrder.price } });
        await Transaction.create({
          userId: updatedOrder.userId,
          amount: updatedOrder.price,
          type: 'refund',
          description: `Refund for expired number ${updatedOrder.phoneNumber} (${updatedOrder.service})`,
          referenceId: updatedOrder._id,
        });

        await AuditLog.create({
          action: 'OTP_ORDER_EXPIRED',
          details: { orderId: updatedOrder._id, refundAmount: updatedOrder.price },
          userId: updatedOrder.userId,
        });
      }

      return res.status(200).json({ success: true, order: updatedOrder });
    }

    // Call SastaOTP getStatus
    const statusData = await sastaOtpService.getStatus(order.activationId);

    if (statusData.sms && statusData.sms.code) {
      // OTP Received!
      const updatedOrder = await OTPOrder.findOneAndUpdate(
        { _id: order._id, status: 'pending' },
        { 
          status: 'completed', 
          smsCode: statusData.sms.code, 
          smsText: statusData.sms.text,
          hasReceivedOtp: true 
        },
        { new: true }
      );
      
      if (!updatedOrder) return res.status(200).json({ success: true, order });

      // Inform provider that SMS was received
      try {
        await sastaOtpService.setStatus(updatedOrder.activationId, 6);
      } catch (err) {
        console.warn('Failed setting status=6 on provider:', err.message);
      }

      await AuditLog.create({
        action: 'OTP_RECEIVED',
        details: { orderId: updatedOrder._id, code: updatedOrder.smsCode },
        userId: updatedOrder.userId,
      });
      
      return res.status(200).json({ success: true, order: updatedOrder });
    } else if (
      statusData.status === 'STATUS_CANCEL' || 
      statusData.error === 'NO_ACTIVATION' || 
      statusData.error === 'STATUS_CANCEL' || 
      (typeof statusData.error === 'string' && statusData.error.includes('CANCEL'))
    ) {
      // Cancelled by provider or user
      const updatedOrder = await OTPOrder.findOneAndUpdate(
        { _id: order._id, status: 'pending' },
        { status: 'cancelled' },
        { new: true }
      );

      if (!updatedOrder) return res.status(200).json({ success: true, order });

      // Refund user if no OTP was received
      if (!updatedOrder.hasReceivedOtp) {
        await User.findByIdAndUpdate(updatedOrder.userId, { $inc: { balance: updatedOrder.price } });
        await Transaction.create({
          userId: updatedOrder.userId,
          amount: updatedOrder.price,
          type: 'refund',
          description: `Refund for cancelled activation ${updatedOrder.phoneNumber}`,
          referenceId: updatedOrder._id,
        });

        await AuditLog.create({
          action: 'OTP_ORDER_CANCELLED_PROVIDER',
          details: { orderId: updatedOrder._id, refundAmount: updatedOrder.price },
          userId: updatedOrder.userId,
        });
      }
      
      return res.status(200).json({ success: true, order: updatedOrder });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually cancel or finish an order
// @route   POST /api/otp/status
// @access  Private
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, action } = req.body; // action: 'cancel' or 'complete'

    if (!orderId || !action) {
      res.status(400);
      throw new Error('Please provide orderId and action');
    }

    const order = await OTPOrder.findOne({ _id: orderId, userId: req.user.id });

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    if (action === 'cancel') {
      if (order.status !== 'pending') {
        res.status(400);
        throw new Error(`Cannot cancel order. Current status: ${order.status}`);
      }

      // Enforce 2-minute wait before manual cancellation
      const twoMinutesInMs = 2 * 60 * 1000;
      const timeElapsed = Date.now() - new Date(order.createdAt).getTime();
      if (timeElapsed < twoMinutesInMs) {
        res.status(400);
        const remainingSeconds = Math.ceil((twoMinutesInMs - timeElapsed) / 1000);
        throw new Error(`Please wait ${remainingSeconds} seconds before cancelling this number.`);
      }

      // Tell SastaOTP to cancel (status = -1)
      const resText = await sastaOtpService.setStatus(order.activationId, -1);

      // We strictly check for 'ACCESS_CANCEL' because 'EARLY_CANCEL_DENIED' contains 'CANCEL'
      if (resText === 'ACCESS_CANCEL') {
        const updatedOrder = await OTPOrder.findOneAndUpdate(
          { _id: order._id, status: 'pending' },
          { status: 'cancelled' },
          { new: true }
        );

        if (!updatedOrder) {
          return res.status(200).json({ success: true, message: 'Order already processed', order });
        }

        // Refund user if no OTP was ever received
        if (!updatedOrder.hasReceivedOtp) {
          await User.findByIdAndUpdate(updatedOrder.userId, { $inc: { balance: updatedOrder.price } });
          await Transaction.create({
            userId: updatedOrder.userId,
            amount: updatedOrder.price,
            type: 'refund',
            description: `Refund for cancelled activation ${updatedOrder.phoneNumber}`,
            referenceId: updatedOrder._id,
          });

          await AuditLog.create({
            action: 'OTP_ORDER_CANCELLED_USER',
            details: { orderId: updatedOrder._id, refundAmount: updatedOrder.price },
            userId: updatedOrder.userId,
          });
          
          return res.status(200).json({
            success: true,
            message: 'Order cancelled and funds refunded successfully',
            order: updatedOrder,
          });
        }

        return res.status(200).json({
          success: true,
          message: 'Order cancelled. No refund given as an OTP was already received for this number.',
          order: updatedOrder,
        });
      } else {
        res.status(400);
        throw new Error(`Provider denied cancellation: ${resText}`);
      }
    } else if (action === 'complete') {
      if (order.status !== 'completed' && !order.smsCode) {
        res.status(400);
        throw new Error('Cannot complete order without receiving OTP first');
      }

      // Tell SastaOTP to complete (status = 6)
      await sastaOtpService.setStatus(order.activationId, 6);

      return res.status(200).json({
        success: true,
        message: 'Order marked as completed',
      });
    } else if (action === 'retry') {
      if (!order.multiSms) {
        res.status(400);
        throw new Error('This number does not support multi-OTP reuse');
      }

      // Tell SastaOTP to retry/get another SMS (status = 3)
      const resText = await sastaOtpService.setStatus(order.activationId, 3);

      if (resText === 'ACCESS_READY' || resText === 'ACCESS_RETRY_GET' || resText.includes('ACCESS')) {
        order.status = 'pending';
        order.smsCode = undefined;
        order.smsText = undefined;
        order.expiresAt = new Date(Date.now() + 1200 * 1000); // Reset expiry timer to 20 mins
        await order.save();

        await AuditLog.create({
          action: 'OTP_ORDER_RETRY_GET',
          details: { orderId: order._id, activationId: order.activationId },
          userId: req.user.id,
        });

        return res.status(200).json({
          success: true,
          message: 'Ready for next OTP. Check dashboard or history for incoming SMS.',
          order,
        });
      } else {
        res.status(400);
        throw new Error(`Provider denied requesting next OTP: ${resText}`);
      }
    } else {
      res.status(400);
      throw new Error('Invalid action. Must be cancel, complete, or retry');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get order history
// @route   GET /api/otp/history
// @access  Private
export const getOrderHistory = async (req, res, next) => {
  try {
    const orders = await OTPOrder.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
};
