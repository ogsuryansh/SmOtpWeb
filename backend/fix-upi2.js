import mongoose from 'mongoose';
import Setting from './models/Setting.js';

const run = async () => {
  try {
    const uri = 'mongodb://suryansh1885_db_user:SC26CAvFy7yENgjw@ac-vqlberz-shard-00-00.ljmgxi4.mongodb.net:27017,ac-vqlberz-shard-00-01.ljmgxi4.mongodb.net:27017,ac-vqlberz-shard-00-02.ljmgxi4.mongodb.net:27017/otpaddaa?ssl=true&replicaSet=atlas-vqlberz-shard-0&authSource=admin&retryWrites=true&w=majority';
    console.log('Connecting...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected!');
    await Setting.findOneAndUpdate(
      { key: 'paymentUpiId' }, 
      { value: 'gulshank@fam' }, 
      { upsert: true }
    );
    console.log('UPI ID fixed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
};
run();
