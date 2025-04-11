import express from 'express';
import { chatController } from '../controller/index.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router("/chats");

// Chat routes
router.post('/', isAuthenticated, chatController.createChat);
router.get('/', isAuthenticated, chatController.getAllChats);
router.get('/:id', isAuthenticated, chatController.getChatById);
router.put('/:id', isAuthenticated, chatController.updateChat);
router.delete('/:id', isAuthenticated, chatController.deleteChat);

export default router;
