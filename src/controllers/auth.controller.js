import logger from "../utils/logger.js";
import { authService } from "../services/auth.service.js";


export const authController = {
    register: async (req, res, next) => {
        try {
            logger.info("Registering user");
            const user = await authService.Register(req.body);
            res.status(201).json(user);
        } catch (error) {
            logger.error("Error registering user:", {error: error.message});
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            logger.info("Logging in user");
            const {email, password} = req.body;
            const user = await authService.Login(email, password);
            res.status(200).json(user);
        } catch (error) {
            logger.error("Error logging in user:", {error: error.message});
            next(error);
        }
    },
    logout: async (req, res, next) => {
        try {
            logger.info("Logging out user");
            const {refreshToken} = req.body;
            await authService.Logout(refreshToken);
            res.status(200).json({message: "Logged out successfully"});
        } catch (error) {
            logger.error("Error logging out user:", {error: error.message});
            next(error);
        }
    },
    sendOTP: async (req, res, next) => {
        try {
            logger.info("Sending OTP");
            const {email} = req.body;
            await authService.sendOTP(email);
            res.status(200).json({message: "OTP sent successfully"});
        } catch (error) {
            logger.error("Error sending OTP:", {error: error.message});
            next(error);
        }
    },
    verifyOTP: async (req, res, next) => {
        try {
            logger.info("Verifying OTP");
            const {email, otp} = req.body;
            await authService.verifyOTP(email, otp);
            res.status(200).json({message: "OTP verified successfully"});
        } catch (error) {
            logger.error("Error verifying OTP:", {error: error.message});
            next(error);
        }
    }
};