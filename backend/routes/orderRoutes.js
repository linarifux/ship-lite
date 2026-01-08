import express from 'express';
import { syncOrders, getOrders } from '../controllers/orderController.js';

const router = express.Router();

router.post('/sync', syncOrders);
router.get('/', getOrders);

export default router;