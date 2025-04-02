import logger from "../utils/logger.js";
import { userService } from "../services/user.service.js";

export const userController = {
    getMe: async (req, res, next) => {
        try {
            logger.info("Getting user profile");
            const userId = req.user.id;
            const user = await userService.getMe(userId);
            res.status(200).json(user);
        } catch (error) {
            logger.error("Error getting user profile:", {error: error.message});
            next(error);
        }
    },
    createProfile: async (req, res, next) => {
        try {
                logger.info("Creating user profile");   
                const userId = req.user.id;
                const profileData = req.body;
                const profile = await userService.createProfile(userId, profileData);
                res.status(201).json(profile);
        } catch (error) {
            logger.error("Error creating user profile:", {error: error.message});
            next(error);
        }
    },
    getAllProfiles: async (req, res, next) => {
        try {
            logger.info("Getting all user profiles");
            const profiles = await userService.getAllProfiles();
            res.status(200).json(profiles);
        } catch (error) {
            logger.error("Error getting all user profiles:", {error: error.message});
            next(error);
        }
    },
    getProfileById: async (req, res, next) => {
        try {
            logger.info("Getting user profile by ID");
            const profileId = req.params.id;
            const profile = await userService.getProfileById(profileId);
            res.status(200).json(profile);
        } catch (error) {
            logger.error("Error getting user profile by ID:", {error: error.message});
            next(error);
        }
    },
    updateProfile: async (req, res, next) => {  
        try {
            logger.info("Updating user profile");
            const profileId = req.params.id;
            const profileData = req.body;
            const profile = await userService.updateProfile(profileId, profileData);
            res.status(200).json(profile);
        } catch (error) {
            logger.error("Error updating user profile:", {error: error.message});
            next(error);
        }
    },
    deleteProfile: async (req, res, next) => {
        try {
            logger.info("Deleting user profile");
            const profileId = req.params.id;
            const profile = await userService.deleteProfile(profileId);
            res.status(200).json(profile);
        } catch (error) {
            logger.error("Error deleting user profile:", {error: error.message});
            next(error);
        }
    },
};

