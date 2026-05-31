import express from 'express';
import {
  getServices,
  getCountries,
  buyNumber,
  pollOrder,
  updateOrderStatus,
  getOrderHistory,
} from '../controllers/otpController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Require authentication for all OTP routes

router.get('/services', getServices);
router.get('/countries', getCountries);
router.post('/buy', buyNumber);
router.get('/order/:id', pollOrder);
router.post('/status', updateOrderStatus);
router.get('/history', getOrderHistory);

export default router;
