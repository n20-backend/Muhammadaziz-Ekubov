import db from "../db/connection.js";
import logger from "../utils/logger.js";
import errorHandler from "../utils/errorHandler.js";
import { userProfileQueries } from "../utils/queries.js";

const userProfileService = {
    getAllProfiles: async () => {
        try {
            const result = await db.query(userProfileQueries.getAllProfiles);
            logger.info("All user profiles retrieved successfully");
            return result.rows;
        } catch (error) {
            logger.error("Error getting all user profiles:", { error: error.message });
            throw error;
        }
    },
    
    getUserProfile: async (userId) => {
        try {
            const result = await db.query(userProfileQueries.getUserProfile, [userId]);
            
            if (!result.rows.length) {
                throw errorHandler.notFound("User profile not found");
            }
            
            logger.info("User profile retrieved successfully", { userId });
            return result.rows[0];
        } catch (error) {
            logger.error("Error getting user profile:", { error: error.message, userId });
            throw error;
        }
    },
    
    updateUserProfile: async (userId, profileData) => {
        try {
            const currentProfile = await db.query(userProfileQueries.getUserProfile, [userId]);
            
            if (!currentProfile.rows.length) {
                throw errorHandler.notFound("User profile not found");
            }

            const updateQuery = userProfileQueries.updateUserProfile(profileData);
            const result = await db.query(updateQuery, [userId, ...Object.values(profileData)]);
            
            logger.info("User profile updated successfully", { userId });
            return result.rows[0];
        } catch (error) {
            logger.error("Error updating user profile:", { error: error.message, userId });
            throw error;
        }
    },
    
    createUserProfile: async (userId, profileData) => {
        try {
            const checkResult = await db.query(userProfileQueries.getUserProfile, [userId]);
            
            if (checkResult.rows.length > 0) {
                throw errorHandler.conflict("User profile already exists");
            }

            const result = await db.query(userProfileQueries.createUserProfile, [
                userId,
                profileData.firstName,
                profileData.lastName,
                profileData.phoneNumber,
                profileData.address,
                profileData.avatarUrl,
                profileData.statusMessage
            ]);
            
            logger.info("User profile created successfully", { userId });
            return result.rows[0];
        } catch (error) {
            logger.error("Error creating user profile:", { error: error.message, userId });
            throw error;
        }
    },
    
    deleteUserProfile: async (userId) => {
        try {
            const result = await db.query(userProfileQueries.deleteUserProfile, [userId]);
            
            if (!result.rows.length) {
                throw errorHandler.notFound("User profile not found");
            }
            
            logger.info("User profile deleted successfully", { userId });
            return { success: true, message: "Profile deleted successfully" };
        } catch (error) {
            logger.error("Error deleting user profile:", { error: error.message, userId });
            throw error;
        }
    }
};

export default userProfileService;



