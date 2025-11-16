import express from 'express';
const router = express.Router();
import * as orderController from '../controllers/order.controller.js';


router.route('/').post(orderController.createOrder);

export default router;
