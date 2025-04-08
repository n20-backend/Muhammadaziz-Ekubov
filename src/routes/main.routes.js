import express from 'express';
import { authController } from '../controller/auth.controller.js';
import { chatController } from '../controller/chat.controller.js';
import { messageController } from '../controller/message.controller.js';
import { callController } from '../controller/call.controller.js';
import { profileController } from '../controller/profile.controller.js';
import { isAuthenticated, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Auth routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/send-otp', authController.sendOTP);
router.post('/auth/verify-otp', authController.verifyOTP);
router.post('/auth/refresh-token', authController.refreshToken);
router.get('/auth/me', isAuthenticated, authController.getCurrentUser);

// Profile routes
router.post('/profiles', isAuthenticated, profileController.createProfile);
router.get('/profiles', isAuthenticated, profileController.getAllProfiles);
router.get('/profiles/:userId', isAuthenticated, profileController.getProfileById);
router.put('/profiles/:userId', isAuthenticated, profileController.updateProfile);
router.delete('/profiles/:userId', isAuthenticated, authorize(['admin']), profileController.deleteProfile);

// Chat routes
router.post('/chats', isAuthenticated, chatController.createChat);
router.get('/chats', isAuthenticated, chatController.getAllChats);
router.get('/chats/:id', isAuthenticated, chatController.getChatById);
router.put('/chats/:id', isAuthenticated, chatController.updateChat);
router.delete('/chats/:id', isAuthenticated, chatController.deleteChat);

// Message routes
router.post('/messages', isAuthenticated, messageController.sendMessage);
router.get('/messages', isAuthenticated, messageController.getAllMessages);
router.get('/messages/:id', isAuthenticated, messageController.getMessageById);
router.put('/messages/:id/status', isAuthenticated, messageController.updateMessageStatus);
router.delete('/messages/:id', isAuthenticated, messageController.deleteMessage);

// Call routes
router.post('/calls', isAuthenticated, callController.startCall);
router.get('/calls', isAuthenticated, callController.getAllCalls);
router.get('/calls/:id', isAuthenticated, callController.getCallById);
router.put('/calls/:id/end', isAuthenticated, callController.endCall);
router.delete('/calls/:id', isAuthenticated, callController.deleteCall);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

export default router;
