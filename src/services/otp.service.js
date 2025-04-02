import OTP from '../models/otpModel.js';
import { Op } from 'sequelize';
import crypto from 'crypto';
import { sendEmail } from '../config/email.js';

// Generate OTP
export const generateOTP = async (userId) => {
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await OTP.create({ userId, code, expiresAt });

    return code;
};

// Verify OTP
export const verifyOTP = async (userId, code) => {
    const otp = await OTP.findOne({
        where: {
            userId,
            code,
            expiresAt: { [Op.gt]: new Date() },
        },
    });

    if (!otp) {
        throw new Error("Invalid or expired code.");
    }

    await otp.destroy();

    return true;
};

// Send OTP by Email
export const sendOTPByEmail = async (userId, email) => {
    const otp = await generateOTP(userId);

    const subject = 'Your OTP code for authentication';
    const text = `Your one-time password: ${otp}. It is valid for 5 minutes.`;

    await sendEmail(email, subject, text);

    return otp;
};
