import logger from "../utils/logger.js";
import userProfileService from "../service/user.profile.service.js";

export const profileController = {
    createProfile: async (req, res, next) => {
        try {
            logger.info("Creating user profile");
            const userId = req.user.id;
            const profileData = req.body;

            const profile = await userProfileService.createUserProfile(userId, profileData);
            
            res.status(201).json({
                userId: profile.userId,
                message: "Profile created"
            });
        } catch (error) {
            logger.error("Error creating user profile:", { error: error.message });
            next(error);
        }
    },

    getAllProfiles: async (req, res, next) => {
        try {
            logger.info("Getting all user profiles");
            
            const profiles = await userProfileService.getAllProfiles();
            
            res.status(200).json(profiles);
        } catch (error) {
            logger.error("Error getting all user profiles:", { error: error.message });
            next(error);
        }
    },

    getProfileById: async (req, res, next) => {
        try {
            const userId = req.params.userId;
            
            logger.info("Getting user profile by ID", { userId });
            
            const profile = await userProfileService.getUserProfile(userId);
            
            res.status(200).json(profile);
        } catch (error) {
            logger.error("Error getting user profile by ID:", { error: error.message });
            next(error);
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const userId = req.params.userId;
            const profileData = req.body;
            
            // Check if the user is updating their own profile or is an admin
            if (req.user.id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ message: "Access denied. You can only update your own profile." });
            }
            
            logger.info("Updating user profile", { userId });
            
            const profile = await userProfileService.updateUserProfile(userId, profileData);
            
            res.status(200).json({
                userId: profile.user_id || profile.userId,
                message: "Profile updated"
            });
        } catch (error) {
            logger.error("Error updating user profile:", { error: error.message });
            next(error);
        }
    },

    deleteProfile: async (req, res, next) => {
        try {
            const userId = req.params.userId;
            
            logger.info("Deleting user profile", { userId });
            
            await userProfileService.deleteUserProfile(userId);
            
            res.status(200).json({ message: "Profile deleted" });
        } catch (error) {
            logger.error("Error deleting user profile:", { error: error.message });
            next(error);
        }
    }
}; 