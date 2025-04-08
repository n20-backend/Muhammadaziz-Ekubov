import jwt from 'jsonwebtoken';
import logger from "../utils/logger.js";
import { authService } from "../service/auth.service.js";
import { sendOTPByEmail, verifyOTP } from "../service/otp.service.js";


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
            const user = await authService.Login(req.body);
            res.cookie("refreshToken", user.refreshToken, {httpOnly: true, maxAge: 604800});
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
            const { email } = req.body;
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];
        
            if (!token) {
                return res.status(401).json({ message: "No token provided" });
            }

       
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const id = decodedToken.id;  

            if (!id) {
                return res.status(401).json({ message: "Invalid token" });
            }

            await sendOTPByEmail(id, email);

            res.status(200).json({ message: "OTP sent successfully" });
        }  catch (error) {
            logger.error("Error sending OTP:", { error: error.message });
            next(error);
        }
    },

    verifyOTP: async (req, res, next) => {
        try {
            logger.info("Verifying OTP");

            const { code } = req.body;

            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(' ')[1];
        
            if (!token) {
                return res.status(401).json({ message: "No token provided" });
            }

       
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const id = decodedToken.id;  

            if (!id) {
                return res.status(401).json({ message: "Invalid token" });
            }


            await verifyOTP(id, code);
            res.status(200).json({message: "OTP verified successfully"});
        } catch (error) {
            logger.error("Error verifying OTP:", {error: error.message});
            next(error);
        }
    },
    refreshToken: async (req, res, next) => {
        try {
            logger.info("Refreshing token");
            
            const authHeader = req.headers.authorization;
            const refreshToken = authHeader && authHeader.split(' ')[1];
            
            if (!refreshToken) {
                return res.status(401).json({ message: "No refresh token provided" });
            }
            
            const user = await authService.RefreshToken(refreshToken);
            res.cookie("refreshToken", user.refreshToken, {httpOnly: true, maxAge: 604800});
            res.status(200).json(user);
        } catch (error) {
            logger.error("Error refreshing token:", {error: error.message});
            next(error);
        }
    },
    getCurrentUser: async (req, res, next) => {
        try {
            logger.info("Getting current user");
            const userId = req.user.id;
            
            const user = await authService.GetCurrentUser(userId);
            res.status(200).json(user);
        } catch (error) {
            logger.error("Error getting current user:", {error: error.message});
            next(error);
        }
    }
};