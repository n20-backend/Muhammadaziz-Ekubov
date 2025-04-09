import express from 'express';
import { chatController } from '../controller/index';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router("/chats");

// Chat routes
router.post('/', isAuthenticated, chatController.createChat);
router.get('/', isAuthenticated, chatController.getAllChats);
router.get('/:id', isAuthenticated, chatController.getChatById);
router.put('/:id', isAuthenticated, chatController.updateChat);
router.delete('/:id', isAuthenticated, chatController.deleteChat);

export default router;
