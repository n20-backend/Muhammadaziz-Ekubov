import { sendOTPByEmail, verifyOTP } from '../services/otp.service.js';
import User from '../models/user.js';

// Send OTP by Email
export const sendOTP = async (req, res) => {
    try {
        const { userId, email } = req.body;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        await sendOTPByEmail(userId, email);

        res.status(200).json({ message: "OTP sent to email." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify OTP
export const verifyOTPCode = async (req, res) => {
    try {
        const { userId, code } = req.body;

        await verifyOTP(userId, code);

        res.status(200).json({ message: "OTP verified." });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
