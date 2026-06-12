import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import { sastaOtpService } from './services/sastaOtpService.js';

async function test() {
  await connectDB();
  const r = await sastaOtpService.getServicesList();
  console.log('Services Keys:', Object.keys(r.services).slice(0, 5));
  console.log('TG Countries count:', r.services.tg.countries.length);
  if (r.services.tg.countries.length > 0) {
     console.log('Sample Country:', r.services.tg.countries[0]);
  }
  process.exit(0);
}

test().catch(console.error);
