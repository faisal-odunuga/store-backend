import express from 'express';
import * as webhookController from '../controllers/webhook.controller.js';

const router = express.Router();

router.post('/clerk', webhookController.clerkWebhook);
router.post('/paystack', webhookController.paystackWebhook);

export default router;
