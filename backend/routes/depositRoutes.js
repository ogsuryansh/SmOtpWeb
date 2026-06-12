import express from 'express';
import { 
  createDepositRequest, 
  getDeposits,
  getPaymentDetails,
  createZapUpiOrder,
  zapUpiWebhook,
  checkZapUpiStatus,
} from '../controllers/depositController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// === PUBLIC ROUTE (called by ZapUPI server, no user auth) ===
// IMPORTANT: Must be declared BEFORE router.use(protect)
router.post('/zapupi/webhook', zapUpiWebhook);

router.use(protect); // Require authentication for all other deposit routes

router.get('/payment-details', getPaymentDetails);
router.post('/', upload.single('screenshot'), createDepositRequest);
router.get('/', getDeposits);

// === ZAPUPI AUTOMATIC PAYMENT (protected) ===
router.post('/zapupi/create-order', createZapUpiOrder);
router.get('/zapupi/status/:orderId', checkZapUpiStatus);

export default router;
