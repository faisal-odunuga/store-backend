import express from 'express';
import * as authController from '../../controllers/auth.controller.js';
import validateZod from '../../middlewares/validateZod.js';
import { loginSchema } from '../../validators/auth.schema.js';

const router = express.Router();

router.post('/login', validateZod(loginSchema), authController.adminLogin);

export default router;
