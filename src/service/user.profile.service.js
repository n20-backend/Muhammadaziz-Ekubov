import logger from "../utils/logger.js";
import db from "../db/connection.js";
import errorHandler from "../utils/errorHandler.js";

const userProfileService = {
    getAllProfiles: async () => {
        try {
            const query = `
                SELECT up.user_id as "userId", up.first_name as "firstName", up.last_name as "lastName", 
                       up.avatar_url as "avatarUrl", up.status_message as "statusMessage",
                       up.created_at as "createdAt", up.updated_at as "updatedAt"
                FROM user_profiles up
                JOIN users u ON up.user_id = u.id
                WHERE u.status = 'active'
            `;
            const result = await db.query(query);
            
            logger.info("All user profiles retrieved successfully");
            return result.rows;
        } catch (error) {
            logger.error("Error getting all user profiles:", { error: error.message });
            throw error;
        }
    },
    
    getUserProfile: async (userId) => {
        try {
            const query = `
                SELECT up.user_id as "userId", up.first_name as "firstName", up.last_name as "lastName", 
                       up.avatar_url as "avatarUrl", up.status_message as "statusMessage",
                       up.created_at as "createdAt", up.updated_at as "updatedAt"
                FROM user_profiles up
                WHERE up.user_id = $1
                LIMIT 1
            `;
            const result = await db.query(query, [userId]);
            
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
            const getProfileQuery = `
                SELECT * FROM user_profiles
                WHERE user_id = $1
                LIMIT 1
            `;
            const currentProfile = await db.query(getProfileQuery, [userId]);
            
            if (!currentProfile.rows.length) {
                throw errorHandler.notFound("User profile not found");
            }
            
            let updateQuery = 'UPDATE user_profiles SET ';
            
            
            if (profileData.firstName && profileData.firstName.trim() !== '') {
                updateQuery += `first_name = '${profileData.firstName}', `;
            }
            
            if (profileData.lastName && profileData.lastName.trim() !== '') {
                updateQuery += `last_name = '${profileData.lastName}', `;
            }
            
            if (profileData.avatarUrl && profileData.avatarUrl.trim() !== '') {
                updateQuery += `avatar_url = '${profileData.avatarUrl}', `;
            }
            
            if (profileData.statusMessage && profileData.statusMessage.trim() !== '') {
                updateQuery += `status_message = '${profileData.statusMessage}', `;
            }
            
            updateQuery += `updated_at = NOW()`;
            
            updateQuery += ` WHERE user_id = '${userId}' RETURNING *`;

            logger.info("Update query:", { updateQuery });
            
            const result = await db.query(updateQuery);
            
            logger.info("User profile updated successfully", { userId });
            return result.rows[0];
        } catch (error) {
            logger.error("Error updating user profile:", { error: error.message, userId });
            throw error;
        }
    },
    
    createUserProfile: async (userId, profileData) => {
        try {
            // Check if profile already exists
            const checkQuery = `
                SELECT * FROM user_profiles
                WHERE user_id = $1
                LIMIT 1
            `;
            const checkResult = await db.query(checkQuery, [userId]);
            
            if (checkResult.rows.length > 0) {
                throw errorHandler.conflict("User profile already exists");
            }
            
            const query = `
                INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url, status_message)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING user_id as "userId", first_name as "firstName", last_name as "lastName", 
                          avatar_url as "avatarUrl", status_message as "statusMessage",
                          created_at as "createdAt", updated_at as "updatedAt"
            `;
            const result = await db.query(query, [
                userId, 
                profileData.firstName, 
                profileData.lastName, 
                profileData.avatarUrl || null, 
                profileData.statusMessage || null
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
            const query = `
                DELETE FROM user_profiles
                WHERE user_id = $1
                RETURNING *
            `;
            const result = await db.query(query, [userId]);
            
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



