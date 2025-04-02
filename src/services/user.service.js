import db from "../models/index.js";
import logger from "../utils/logger.js";

export const userService = {
    getMe: async (userId) => {
        try {
            const user = await db.User.findByPk(userId, {
                attributes: { 
                    exclude: ['password', 'deletedAt']  
                }
            });
            
            if (!user) {
                throw new Error('User not found');
            }
            
            return {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };
        } catch (error) {
            logger.error("Error getting user:", {error: error.message});
            throw error;
        }
    },
    createProfile: async (userId, profileData) => {
        try {
            logger.info("Creating user profile", { userId });
            
            const { firstName, lastName, avatarUrl, statusMessage } = profileData;
            
            const user = await db.User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            const existingProfile = await db.UserProfile.findOne({ where: { userId } });
            if (existingProfile) {
                throw new Error('Profile already exists for this user');
            }
            
            const newProfile = await db.UserProfile.create({
                userId,
                firstName,
                lastName,
                avatarUrl,
                statusMessage
            });
            
            logger.info("User profile created successfully", { userId });
            
            return {
                userId,
                message: "Profile created"
            };
        } catch (error) {
            logger.error("Error creating user profile:", { error: error.message, userId });
            throw error;
        }
    },
    getAllProfiles: async () => {
        try {
            const profiles = await db.UserProfile.findAll();
            return profiles;
        } catch (error) {
            logger.error("Error getting all user profiles:", { error: error.message }); 
            throw error;
        }
    },
    getProfileById: async (profileId) => {
        try {
            const profile = await db.UserProfile.findByPk(profileId)
            if (!profile) {
                logger.error("Profile not found", { profileId });
                throw new Error("Profile not found");
            }
            return profile;
        } catch (error) {
            logger.error("Error getting user profile by ID:", { error: error.message, profileId });
            throw error;
        }
    },
    updateProfile: async (profileId, profileData) => {
        try {
            const { firstName, lastName, avatarUrl, statusMessage } = profileData;
            
            const profile = await db.UserProfile.findByPk(profileId);
            if (!profile) {
                logger.error("Profile not found", { profileId });
                throw new Error("Profile not found");
            }
            
            await profile.update({
                firstName,
                lastName,
                avatarUrl,
                statusMessage
            });
            
            logger.info("User profile updated successfully", { profileId });
            
            return {profileId, message: "Profile updated"};
        } catch (error) {
            logger.error("Error updating user profile:", { error: error.message, profileId });
            throw error;
        }
    },
    deleteProfile: async (profileId) => {
        try {
            const profile = await db.UserProfile.findByPk(profileId);
            if (!profile) {
                logger.error("Profile not found", { profileId });
                throw new Error("Profile not found");
            }
            
            await profile.destroy();
            logger.info("User profile deleted successfully", { profileId });
            
            return {
                message: "Profile deleted"
            };
        } catch (error) {
            logger.error("Error deleting user profile:", { error: error.message, profileId });
            throw error;
        }
    },
}
