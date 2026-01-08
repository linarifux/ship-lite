import express from 'express';
import { install, callback } from '../controllers/shopifyAuthController.js';

const router = express.Router();

router.get('/auth', install);
router.get('/callback', callback);

export default router;