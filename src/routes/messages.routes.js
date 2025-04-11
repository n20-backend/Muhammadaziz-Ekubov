import express from 'express';
import { messageController } from '../controller/index.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = express.Router("/messages");

// Message routes
router.post('/', isAuthenticated, messageController.sendMessage);
router.get('/', isAuthenticated, messageController.getAllMessages);
router.get('/:id', isAuthenticated, messageController.getMessageById);
router.put('/:id/status', isAuthenticated, messageController.updateMessageStatus);
router.delete('/:id', isAuthenticated, messageController.deleteMessage);

export default router;
