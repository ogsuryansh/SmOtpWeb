import mongoose from 'mongoose';
import Setting from '../models/Setting.js';
import User from '../models/User.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
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
    { key: 'minDeposit', value: 10 },
    { key: 'paymentQrCode', value: '' },
    { key: 'paymentUpiId', value: 'pay@upi' },
    { key: 'markupPercentage', value: 20 },
    { key: 'multiSmsMultiplier', value: 2 },
    { key: 'apiPriceMultiplier', value: 96 }, // Converts API cost units to INR (matches 247otp.com rates: 1 unit = ~Rs.95.37)
  ];

  for (const item of defaultSettings) {
    const exists = await Setting.findOne({ key: item.key });
    if (!exists) {
      await Setting.create(item);
      console.log(`Seeded setting: ${item.key}`);
    } else if (item.key === 'paymentUpiId' && (exists.value.includes('<img') || exists.value.includes('onerror'))) {
      exists.value = 'gulshank@fam';
      await exists.save();
      console.log(`Sanitized malicious setting: ${item.key}`);
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
      balance: 1000.0,
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
    // Cannot directly compare password if select: false is used, 
    // but we can assume admin uses the seeded one or changed it.
    // Actually we need to fetch password explicitly to compare
    const adminWithPassword = await User.findOne({ role: 'admin' }).select('+password');
    if (adminWithPassword) {
        const isMatch = await adminWithPassword.matchPassword(adminPassword);
        if (!isMatch) {
          adminWithPassword.password = adminPassword;
          await adminWithPassword.save();
          console.log(`Updated seeded admin credentials`);
        } else if (needsSave) {
          await admin.save();
          console.log(`Updated seeded admin credentials`);
        }
    }
  }
};

export default connectDB;
