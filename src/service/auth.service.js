import { hashPassword, comparePassword } from "../utils/crypto.js";
import { validateEmail } from "../utils/validator.js"
import errorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";
import tokenService  from "./token.service.js";
import db from "../db/connection.js";
import jwtConfig from "../config/jwt.js";
import { authQueries } from "../utils/queries.js";

export const authService = {
    Register: async (userData) => {
        try {
            const user = userData;

            if (!user.email || !user.username || !user.password || !user.confirmPassword ) {
                throw errorHandler.badRequest("All fields are required");
            }

            const existingUserResult = await db.query(authQueries.checkExistingUser, [user.email, user.username]);
            
            if (existingUserResult.rows.length > 0) {
                throw errorHandler.conflict("User already exists");
            }
            
            if (user.password !== user.confirmPassword) {
                throw errorHandler.badRequest("Password and confirm password do not match");
            }

            logger.info("Registering new user:", {data: userData});

            const hashedPassword = await hashPassword(user.password);

            const newUserResult = await db.query(authQueries.insertUser, [user.email, user.username, hashedPassword]);
            
            await sendOTPByEmail(newUserResult.rows[0].id, newUserResult.rows[0].email); 
            
            logger.info("User registered successfully:", {data: newUserResult.rows[0]});

            return {
                message: "User registered successfully",
                id: newUserResult.rows[0].id,
                otpSent: true,
            };
        } catch (error) {
            logger.error("Error registering user:", {error: error.message});
            throw error;
        }
    },
    Login: async (userData) => {
        try {
            const existUser = userData;

            if (!existUser.email || !existUser.password) {
                throw errorHandler.badRequest("All fields are required");
            }

            if (!validateEmail(existUser.email)) {
                throw errorHandler.badRequest("Email not correct!");
            }

            const userResult = await db.query(authQueries.getUserByEmail, [existUser.email]);
            
            if (userResult.rows.length === 0) {
                throw errorHandler.unauthorized("Invalid credentials");
            }
            
            const user = userResult.rows[0];

            const isPasswordValid = await comparePassword(existUser.password, user.password);
            if (!isPasswordValid) {
                throw errorHandler.unauthorized("Invalid credentials");
            }

            const token = tokenService.generateToken(user.id, user.username, user.email);
            const refreshToken = tokenService.generateRefreshToken(user.id, user.username, user.email);

            return {
                accessToken: token,
                refreshToken: refreshToken,
                accessExpiresIn: jwtConfig.access.expiresIn,
                refreshExpiresIn: jwtConfig.refresh.expiresIn
            }
        } catch (error) {
            logger.error("Error logging in user:", { error: error.message });
            throw error;
        }
    },
    Logout: async (refreshToken) => {
        try {
            if (!refreshToken) {
                throw errorHandler.badRequest("Refresh token is required");
            }
            
            const decoded = tokenService.verifyRefreshToken(refreshToken);
            
            const userResult = await db.query(authQueries.getUserById, [decoded.userId]);
            
            if (userResult.rows.length === 0) {
                throw errorHandler.notFound("User not found");
            }
            
            logger.info("User logged out successfully", { userId: decoded.userId });
            return { success: true, message: "Logged out successfully" };
        } catch (error) {
            logger.error("Error logging out user:", { error: error.message, stack: error.stack });
            throw error;
        }
    },
    RefreshToken: async (refreshToken) => {
        try {
            const decoded = tokenService.verifyRefreshToken(refreshToken);
            
            logger.info("Decoded refresh token:", { decoded: decoded });
            const userResult = await db.query(authQueries.getUserById, [decoded.id]);
            
            if (userResult.rows.length === 0) {
                throw errorHandler.notFound("User not found");
            }
            
            const user = userResult.rows[0];
            const token = tokenService.generateToken(user.id, user.username, user.email);
            
            return { token };
        } catch (error) {
            logger.error("Error refreshing token:", { error: error.message });
            throw error;
        }
    },
    GetCurrentUser: async (userId) => {
        try {
            if (!userId) {
                throw errorHandler.badRequest("User ID is required");
            }
            
            const userResult = await db.query(authQueries.getCurrentUser, [userId]);
            
            if (userResult.rows.length === 0) {
                throw errorHandler.notFound("User not found");
            }
            
            return userResult.rows[0];
        } catch (error) {
            logger.error("Error getting current user:", { error: error.message });
            throw error;
        }
    }   
}