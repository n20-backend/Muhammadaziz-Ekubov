import { hashPassword, comparePassword } from "../utils/crypto.js";
import { validateEmail } from "../utils/validator.js"
import errorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";
import tokenService  from "./token.service.js";
import db from "../db/connection.js";
import jwtConfig from "../config/jwt.js";
// import { sendEmail } from "../config/email.js";
// import { sendOTPByEmail } from "./otp.service.js";



export const authService = {
    Register: async (userData) => {
        try {
            const user = userData;

            if (!user.email || !user.username || !user.password || !user.confirmPassword ) {
                throw errorHandler.badRequest("All fields are required");
            }

            
            const existingUserQuery = `
                SELECT * FROM users 
                WHERE email = $1 OR username = $2
                LIMIT 1
                `;
                const existingUserResult = await db.query(existingUserQuery, [user.email, user.username]);
                
                if (existingUserResult.rows.length > 0) {
                    throw errorHandler.conflict("User already exists");
                }
                
                if (user.password !== user.confirmPassword) {
                    throw errorHandler.badRequest("Password and confirm password do not match");
                }

            logger.info("Registering new user:", {data: userData});

            const hashedPassword = await hashPassword(user.password);

            const insertUserQuery = `
                INSERT INTO users (email, username, password)
                VALUES ($1, $2, $3)
                RETURNING id, email
            `;
            const newUserResult = await db.query(insertUserQuery, [user.email, user.username, hashedPassword]);
            
        
            // await sendOTPByEmail(newUserResult.rows[0].id, newUserResult.rows[0].email); 
            
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

            const userQuery = `
                SELECT * FROM users 
                WHERE email = $1
                LIMIT 1
            `;
            const userResult = await db.query(userQuery, [existUser.email]);
            
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
            
            const userQuery = `
                SELECT * FROM users 
                WHERE id = $1
                LIMIT 1
            `;
            const userResult = await db.query(userQuery, [decoded.userId]);
            
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
            
            const userQuery = `
                SELECT * FROM users 
                WHERE id = $1
                LIMIT 1
            `;
            logger.info("Decoded refresh token:", { decoded: decoded });
            const userResult = await db.query(userQuery, [decoded.id]);
            
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
            
            const userQuery = `
                SELECT u.id, u.email, u.username, u.role, u.status, u.created_at as "createdAt", u.updated_at as "updatedAt",
                       up.first_name as "firstName", up.last_name as "lastName", up.avatar_url as "avatarUrl", up.status_message as "statusMessage"
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                WHERE u.id = $1
                LIMIT 1
            `;
            const userResult = await db.query(userQuery, [userId]);
            
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