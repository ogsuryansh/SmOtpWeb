import mongoose from 'mongoose';

const uri = 'mongodb://suryansh1885_db_user:SC26CAvFy7yENgjw@ac-vqlberz-shard-00-00.ljmgxi4.mongodb.net:27017,ac-vqlberz-shard-00-01.ljmgxi4.mongodb.net:27017,ac-vqlberz-shard-00-02.ljmgxi4.mongodb.net:27017/otpaddaa?ssl=true&replicaSet=atlas-vqlberz-shard-0&authSource=admin&retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });
