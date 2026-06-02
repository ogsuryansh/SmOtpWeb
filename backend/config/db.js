import { connectJsonDb } from './jsonDb.js';
import Setting from '../models/Setting.js';
import User from '../models/User.js';

const connectDB = async () => {
  try {
    connectJsonDb();
    
    // Seed default settings
    await seedSettings();
    
    // Seed default admin user
    await seedAdmin();
  } catch (error) {
    console.error(`DB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const seedSettings = async () => {
  const defaultSettings = [
    { key: 'siteName', value: 'OTPAddaa' },
    { key: 'maintenanceMode', value: 'false' },
    { key: 'sastaOtpApiKey', value: process.env.SASTA_OTP_API_KEY || 'mock' },
    { key: 'minDeposit', value: 10 }, // Default min deposit INR 10
    { key: 'paymentQrCode', value: '' }, // QR image URL/Base64
    { key: 'paymentUpiId', value: 'pay@upi' },
    { key: 'markupPercentage', value: 20 }, // 20% mark-up on API prices
    { key: 'multiSmsMultiplier', value: 2 }, // multiplier for multi-SMS numbers (e.g. 2x)
  ];

  for (const item of defaultSettings) {
    const exists = await Setting.findOne({ key: item.key });
    if (!exists) {
      await Setting.create(item);
      console.log(`Seeded setting: ${item.key}`);
    }
  }
};

const seedAdmin = async () => {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@otpaddaa.com';
  const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'AdminPassword123!';

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    await User.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      balance: 1000.0, // Pre-fund admin wallet for testing
    });
    console.log(`Seeded default admin user: ${adminEmail}`);
  } else {
    let needsSave = false;
    if (admin.username !== adminUsername) {
      admin.username = adminUsername;
      needsSave = true;
    }
    if (admin.email !== adminEmail) {
      admin.email = adminEmail;
      needsSave = true;
    }
    const isMatch = await admin.matchPassword(adminPassword);
    if (!isMatch) {
      admin.password = adminPassword;
      needsSave = true;
    }
    if (needsSave) {
      await admin.save();
      console.log(`Updated seeded admin credentials to match current .env settings`);
    }
  }
};

export default connectDB;
