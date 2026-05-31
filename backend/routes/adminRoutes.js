import express from 'express';
import {
  getStats,
  getUsers,
  updateUser,
  getDeposits,
  processDeposit,
  getOTPOrders,
  getSettings,
  updateSettings,
} from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly); // Require admin privileges for all admin subroutes

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/deposits', getDeposits);
router.put('/deposits/:id', processDeposit);
router.get('/orders', getOTPOrders);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
