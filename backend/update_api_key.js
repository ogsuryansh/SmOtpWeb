import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Setting from './models/Setting.js';
import { otpService } from './services/otpService.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const newKey = '38ac895e9a82e976b923e45026a2bdb6';

    // Update both keys just to be safe
    await Setting.findOneAndUpdate(
      { key: 'otpApiKey' },
      { value: newKey },
      { upsert: true }
    );
    await Setting.findOneAndUpdate(
      { key: 'sastaOtpApiKey' },
      { value: newKey },
      { upsert: true }
    );
    console.log('API Key updated in database to: ' + newKey);

    // Ensure URL is set to 247OTP Supabase backend
    await Setting.findOneAndUpdate(
      { key: 'otpProviderUrl' },
      { value: 'https://mxfkruqagyqgvvcwezkx.supabase.co/functions/v1/handler-api' },
      { upsert: true }
    );

    console.log('Fetching balance...');
    const result = await otpService.getBalance();
    console.log('Balance Result:', result);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
