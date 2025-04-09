// User Profile Queries
export const userProfileQueries = {
    getAllProfiles: `
        SELECT up.*, u.username, u.email 
        FROM user_profiles up
        JOIN users u ON up.user_id = u.id
        WHERE u.status = 'active'
    `,
    
    getUserProfile: `
        SELECT up.*, u.username, u.email 
        FROM user_profiles up
        JOIN users u ON up.user_id = u.id
        WHERE up.user_id = $1
    `,
    
    updateUserProfile: (fields) => {
        const setClause = Object.keys(fields)
            .map((field, index) => `${field} = $${index + 2}`)
            .join(', ');
        return `
            UPDATE user_profiles 
            SET ${setClause}
            WHERE user_id = $1
            RETURNING *
        `;
    },
    
    createUserProfile: `
        INSERT INTO user_profiles (user_id, first_name, last_name, phone_number, address, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
    `,
    
    deleteUserProfile: `
        DELETE FROM user_profiles
        WHERE user_id = $1
    `
};

// OTP Queries
export const otpQueries = {
    insertOtp: `
        INSERT INTO otps (user_id, code, expires_at, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING code
    `,
    
    findOtp: `
        SELECT * FROM otps
        WHERE user_id = $1 AND code = $2 AND expires_at > $3
        LIMIT 1
    `,
    
    updateUserStatus: `
        UPDATE users
        SET status = 'active'
        WHERE id = $1
    `,
    
    deleteOtp: `
        DELETE FROM otps
        WHERE user_id = $1 AND code = $2
    `
}; 