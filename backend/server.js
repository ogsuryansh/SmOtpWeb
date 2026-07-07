import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import depositRoutes from './routes/depositRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware Imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Initialize Env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
const allowedOrigins = [
  'http://localhost:5173', 
  'http://127.0.0.1:5173',
  'https://otpaddaa.shop',
  'https://www.otpaddaa.shop',
  'https://sm-otp-web.vercel.app'
];
if (process.env.FRONTEND_URL) {
  const cleanOrigin = process.env.FRONTEND_URL.replace(/\/$/, '');
  allowedOrigins.push(cleanOrigin);
}

// Add No-Cache headers to prevent Vercel Edge from caching CORS responses for different origins
app.use((req, res, next) => {
  res.header('Vary', 'Origin');
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get Directory Name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
const uploadsDir = isVercel ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, 'uploads');

// Serve uploads folder static files
app.use('/uploads', express.static(uploadsDir));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    frontendUrl: process.env.FRONTEND_URL || 'not set',
    allowedOrigins: allowedOrigins
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/deposits', depositRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

if (!isVercel && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
