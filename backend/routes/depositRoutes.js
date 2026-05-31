import express from 'express';
import { 
  createDepositRequest, 
  getDeposits,
  getPaymentDetails 
} from '../controllers/depositController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // Require authentication for all deposit routes

router.get('/payment-details', getPaymentDetails);
router.post('/', upload.single('screenshot'), createDepositRequest);
router.get('/', getDeposits);

export default router;
