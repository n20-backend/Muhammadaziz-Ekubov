import db from "../models/index.js";
import errorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";
import { hashPassword, comparePassword } from "../utils/crypto.js";
import { tokenService } from "./token.service.js";
import { validateEmail } from "../utils/validator.js"


export const authService = {
    Register: async (userData) => {
        try {
            logger.info("Registering user");
            const {
                email,
                username,
                password,
                confirmPassword,
                role,
                firstName,
                lastName
            } = userData;

            if (!email || !username || !password || !confirmPassword || !role) {
                throw errorHandler.badRequest("All fields are required");
            }

            logger.info("Registering new user:", {data: userData});

            const existingUser = await db.User.findOne({where: {email} || {username}});
            if (existingUser) {
                throw errorHandler.conflict("User already exists");
            }

            if (password !== confirmPassword) {
                throw errorHandler.badRequest("Password and confirm password do not match");
            }

            const hashedPassword = await hashPassword(password);

            const newUser = await db.User.create({
                email: email,   
                username: username,
                password: hashedPassword,
                role: role,
                firstName: firstName,
                lastName: lastName
            });

            logger.info("User registered successfully:", {data: newUser});

            return newUser;
        } catch (error) {
            logger.error("Error registering user:", {error: error.message});
            throw error;
        }
    },
    Login: async (userData) => {
        try {
            const {email, password} = userData;

            if (!email || !password) {
                throw errorHandler.badRequest("All fields are required");
            }

            if(!validateEmail(email)) {
                throw errorHandler.badRequest("Email not correct!")
            }

            const user = await db.User.findOne({where: {email}});
            if (!user) {
                throw errorHandler.unauthorized("Invalid credentials");
            }

            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw errorHandler.unauthorized("Invalid credentials");
            }

            const token = tokenService.generateToken(user.id, user.firstName, user.email);
            const refreshToken = tokenService.generateRefreshToken(user.id, user.firstName, user.email);

            return {token, refreshToken};
        } catch (error) {
            logger.error("Error logging in user:", {error: error.message});
            throw error;
        }
    },
    Logout: async (refreshToken) => {
        try {
            if (!refreshToken) {
                throw errorHandler.badRequest("Refresh token is required");
            }
            
            const decoded = tokenService.verifyRefreshToken(refreshToken);
            
           
            const user = await db.User.findByPk(decoded.userId);
            if (!user) {
                throw errorHandler.notFound("User not found");
            }
            
            await db.User.update(
                { refreshToken: null },
                { where: { id: decoded.userId } }
            );
            
            logger.info("User logged out successfully", { userId: decoded.userId });
            return { success: true, message: "Logged out successfully" };
        } catch (error) {
            logger.error("Error logging out user:", { error: error.message, stack: error.stack });
            throw error;
        }
    },
    sendOTP: async (email) => {
        try {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const subject = "OTP Verification";
            const text = `Your OTP is ${otp}`;
            await sendEmail(email, subject, text);  
        } catch (error) {
            logger.error("Error sending OTP:", {error: error.message});
            throw error;
        }
    },
    verifyOTP: async (email, otp) => {
        try {
            const user = await db.User.findOne({where: {email}});
            if (!user) {
                throw errorHandler.unauthorized("Invalid credentials");
            }

            const isOTPValid = await comparePassword(otp, user.otp);
            if (!isOTPValid) {
                throw errorHandler.unauthorized("Invalid OTP");
            }

            await db.User.update({otp: null}, {where: {email}});

            return user;
        } catch (error) {
            logger.error("Error verifying OTP:", {error: error.message});
            throw error;
        }
    },
    refreshToken: async (refreshToken) => {
        try {
            const decoded = tokenService.verifyRefreshToken(refreshToken);
            const user = await db.User.findByPk(decoded.userId);
            return user;
        } catch (error) {
            logger.error("Error refreshing token:", {error: error.message});
            throw error;
        }
    

    }   
}