import express from 'express';
import { getRates, purchaseLabel } from '../controllers/shipmentController.js';

const router = express.Router();

router.post('/rates', getRates);
router.post('/buy', purchaseLabel);

export default router;