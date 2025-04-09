import express from 'express';
import { callController } from '../controller/index';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = express.Router("/calls");

// Call routes
router.post('/', isAuthenticated, callController.startCall);
router.get('/', isAuthenticated, callController.getAllCalls);
router.get('/:id', isAuthenticated, callController.getCallById);
router.put('/:id/end', isAuthenticated, callController.endCall);
router.delete('/:id', isAuthenticated, callController.deleteCall);

