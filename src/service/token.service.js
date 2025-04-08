import jwt from "jsonwebtoken";
import jwtConfig from "../config/jwt.js";

const tokenService = {
    generateToken: (id, username, email) => {
        return jwt.sign(
            {id, username, email}, 
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
    
    generateRefreshToken: (id, username, email) => {
        return jwt.sign(
            {id, username, email}, 
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
    },
}

export default tokenService;