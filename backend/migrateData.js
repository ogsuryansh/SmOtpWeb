import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Setting from './models/Setting.js';
import Deposit from './models/Deposit.js';
import OTPOrder from './models/OTPOrder.js';
import Transaction from './models/Transaction.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

const migrate = async () => {
  try {
    // Use direct connection to bypass Node.js DNS SRV bug on Windows
    const uri = "mongodb://suryansh1885_db_user:SC26CAvFy7yENgjw@ac-vqlberz-shard-00-01.ljmgxi4.mongodb.net:27017/smwebotp?tls=true&authSource=admin&directConnection=true";
    const conn = await mongoose.connect(uri);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    
    // Check if data is already migrated
    const userCount = await User.countDocuments();
    if (userCount > 0) {
       console.log("Database already contains data. Clearing to re-migrate...");
       await User.deleteMany({});
       await Setting.deleteMany({});
       await Deposit.deleteMany({});
       await OTPOrder.deleteMany({});
       await Transaction.deleteMany({});
       await AuditLog.deleteMany({});
    }

    const idMap = {}; // Maps old string ID to new ObjectId

    const readJson = (filename) => {
      const p = path.join(DATA_DIR, filename);
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
      return [];
    };

    console.log("Loading JSON data...");
    const users = readJson('users.json');
    const settings = readJson('settings.json');
    const deposits = readJson('deposits.json');
    const otporders = readJson('otporders.json');
    const transactions = readJson('transactions.json');
    const auditlogs = readJson('auditlogs.json');

    // 1. Migrate Users
    console.log(`Migrating ${users.length} users...`);
    for (const u of users) {
      const newId = new mongoose.Types.ObjectId();
      idMap[u._id] = newId;
      
      const newU = { ...u, _id: newId };
      delete newU.$inc; // Clean up old jsonDb artifact
      if (newU.createdAt) newU.createdAt = new Date(newU.createdAt);
      if (newU.updatedAt) newU.updatedAt = new Date(newU.updatedAt);
      
      await User.collection.insertOne(newU);
    }

    // 2. Migrate Settings
    console.log(`Migrating ${settings.length} settings...`);
    for (const s of settings) {
      const newId = new mongoose.Types.ObjectId();
      idMap[s._id] = newId;
      await Setting.create({ ...s, _id: newId });
    }

    // 3. Migrate Deposits
    console.log(`Migrating ${deposits.length} deposits...`);
    for (const d of deposits) {
      const newId = new mongoose.Types.ObjectId();
      idMap[d._id] = newId;
      
      const newD = { ...d, _id: newId };
      if (newD.userId) newD.userId = idMap[newD.userId] || newD.userId;
      if (newD.processedBy) newD.processedBy = idMap[newD.processedBy] || newD.processedBy;
      
      await Deposit.create(newD);
    }

    // 4. Migrate OTP Orders
    console.log(`Migrating ${otporders.length} OTP orders...`);
    for (const o of otporders) {
      const newId = new mongoose.Types.ObjectId();
      idMap[o._id] = newId;
      
      const newO = { ...o, _id: newId };
      if (newO.userId) newO.userId = idMap[newO.userId] || newO.userId;
      
      await OTPOrder.create(newO);
    }

    // 5. Migrate Transactions
    console.log(`Migrating ${transactions.length} transactions...`);
    for (const t of transactions) {
      const newId = new mongoose.Types.ObjectId();
      idMap[t._id] = newId;
      
      const newT = { ...t, _id: newId };
      if (newT.userId) newT.userId = idMap[newT.userId] || newT.userId;
      if (newT.referenceId && idMap[newT.referenceId]) {
        newT.referenceId = String(idMap[newT.referenceId]);
      }
      
      await Transaction.create(newT);
    }

    // 6. Migrate AuditLogs
    console.log(`Migrating ${auditlogs.length} audit logs...`);
    const logsToInsert = [];
    for (const a of auditlogs) {
      const newId = new mongoose.Types.ObjectId();
      idMap[a._id] = newId;
      
      const newA = { ...a, _id: newId };
      if (newA.userId) newA.userId = idMap[newA.userId] || newA.userId;
      if (newA.details && newA.details.orderId && idMap[newA.details.orderId]) {
        newA.details.orderId = String(idMap[newA.details.orderId]);
      }
      logsToInsert.push(newA);
    }
    if (logsToInsert.length > 0) {
      // Use insertMany for audit logs since there might be many
      await AuditLog.insertMany(logsToInsert);
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
