import crypto from 'crypto';
import { sendEmail } from '../config/email.js';
import db from '../db/connection.js';
import logger from '../utils/logger.js';
import errorHandler from '../utils/errorHandler.js';

// Generate OTP
export const generateOTP = async (id) => {
    try {
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        
        const insertOtpQuery = `
            INSERT INTO otps (user_id, code, expires_at, created_at)
            VALUES ($1, $2, $3, NOW())
            RETURNING code
        `;
        
        const result = await db.query(insertOtpQuery, [id, code, expiresAt]);
        
        return code;
    } catch (error) {
        logger.error("Error generating OTP:", { error: error.message });
        throw error;
    }
};

// Verify OTP
export const verifyOTP = async (id, code) => {
    try {
        const currentTime = new Date();
        
        const findOtpQuery = `
            SELECT * FROM otps
            WHERE user_id = $1 AND code = $2 AND expires_at > $3
            LIMIT 1
        `;
        
        const result = await db.query(findOtpQuery, [id, code, currentTime]);
        
        if (result.rows.length === 0) {
            throw errorHandler.badRequest("Invalid or expired code.");
        }
        
        // Update user status to active
        const updateUserStatusQuery = `
            UPDATE users
            SET status = 'active'
            WHERE id = $1
        `;
        
        await db.query(updateUserStatusQuery, [id]);
        
        // Delete the used OTP
        const deleteOtpQuery = `
            DELETE FROM otps
            WHERE user_id = $1 AND code = $2
        `;
        
        await db.query(deleteOtpQuery, [id, code]);
        
        return true;
    } catch (error) {
        logger.error("Error verifying OTP:", { error: error.message });
        throw error;
    }
};

// Send OTP by Email
export const sendOTPByEmail = async (id,email) => {
    try {
        const otp = await generateOTP(id);
        
        const subject = 'Your OTP code for authentication';
        const text = `Your one-time password: ${otp}. It is valid for 5 minutes.`;
        
        await sendEmail(email, subject, text);
        
        return otp;
    } catch (error) {
        logger.error("Error sending OTP by email:", { error: error.message });
        throw error;
    }
};