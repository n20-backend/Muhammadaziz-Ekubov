import express from 'express';
import { authController } from '../controller/index.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router("/auth");

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', isAuthenticated, authController.getCurrentUser);

export default router;
