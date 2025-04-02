import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";

export const tokenService = {
    generateToken: (userId, firstName, email) => {
        return jwt.sign(
            {userId, firstName, email}, 
            jwtConfig.access.secret, 
            {
                expiresIn: jwtConfig.access.expiresIn,
                algorithm: jwtConfig.access.algorithm
            }
        );
    },
    
    verifyToken: (token) => {
        try {
            return jwt.verify(token, jwtConfig.access.secret, jwtConfig.verifyOptions);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    },
    
    generateRefreshToken: (userId, firstName, email) => {
        return jwt.sign(
            {userId, firstName, email}, 
            jwtConfig.refresh.secret, 
            {
                expiresIn: jwtConfig.refresh.expiresIn,
                algorithm: jwtConfig.refresh.algorithm
            }
        );
    },
    
    verifyRefreshToken: (token) => {
        try {
            return jwt.verify(token, jwtConfig.refresh.secret, jwtConfig.verifyOptions);
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
};
