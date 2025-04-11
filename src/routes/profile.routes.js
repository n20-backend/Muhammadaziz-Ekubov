import express from 'express';
import { profileController } from '../controller/index.js';
import { isAuthenticated, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Profile routes
router.post('/', isAuthenticated, profileController.createProfile);
router.get('/', isAuthenticated, profileController.getAllProfiles);
router.get('/:userId', isAuthenticated, profileController.getProfileById);
router.put('/:userId', isAuthenticated, profileController.updateProfile);
router.delete('/:userId', isAuthenticated, authorize(['admin']), profileController.deleteProfile);

export default router;
