import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import Setting from './models/Setting.js';

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Setting.findOneAndUpdate(
      { key: 'paymentUpiId' }, 
      { value: 'gulshank@fam' }, 
      { upsert: true }
    );
    console.log('UPI ID fixed successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run();
