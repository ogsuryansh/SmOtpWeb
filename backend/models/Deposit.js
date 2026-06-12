import mongoose from 'mongoose';

const depositSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    utr: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // ZapUPI automatic payment fields
    payment_method: {
      type: String,
      enum: ['manual', 'zapupi'],
      default: 'manual',
    },
    zapupi_order_id: {
      type: String,
      default: null,
      index: true,
    },
    zapupi_txn_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Deposit = mongoose.model('Deposit', depositSchema);
export default Deposit;
