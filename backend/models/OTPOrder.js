import mongoose from 'mongoose';

const otpOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activationId: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    service: {
      type: String,
      required: true,
    },
    serviceCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    apiPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'expired'],
      default: 'pending',
    },
    multiSms: {
      type: Boolean,
      default: false,
    },
    smsCode: {
      type: String,
    },
    smsText: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const OTPOrder = mongoose.model('OTPOrder', otpOrderSchema);
export default OTPOrder;
