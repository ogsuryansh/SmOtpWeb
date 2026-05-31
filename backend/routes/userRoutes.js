import express from 'express';
import { updateProfile, getTransactions } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All user routes require authentication

router.put('/profile', updateProfile);
router.get('/transactions', getTransactions);

export default router;
