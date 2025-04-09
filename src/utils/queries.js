export const authQueries = {
    createUser: `
    INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `,

    checkExistingUser: `
    SELECT * FROM users 
    WHERE email = $1 OR username = $2
    LIMIT 1
    `,

    insertUser: `
    INSERT INTO users (email, username, password)
    VALUES ($1, $2, $3)
    RETURNING id, email
    `,

    getUserByEmail: `
    SELECT * FROM users 
    WHERE email = $1
    LIMIT 1
    `,

    getUserById: `
    SELECT * FROM users 
    WHERE id = $1
    LIMIT 1
    `,

    getCurrentUser: `
    SELECT u.id, u.email, u.username, u.role, u.status, u.created_at as "createdAt", u.updated_at as "updatedAt",
           up.first_name as "firstName", up.last_name as "lastName", up.avatar_url as "avatarUrl", up.status_message as "statusMessage"
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = $1
    LIMIT 1
    `
}

export const userQueries = {
    createUserProfile: `
    INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url, status_message)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,

    updateUserProfile: `
    UPDATE user_profiles 
    SET 
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        avatar_url = COALESCE($4, avatar_url),
        status_message = COALESCE($5, status_message),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *
    `,

    getUserProfile: `
    SELECT 
        up.*,
        u.email,
        u.username,
        u.status as user_status,
        u.role as user_role
    FROM user_profiles up
    JOIN users u ON u.id = up.user_id
    WHERE up.user_id = $1
    `,

    deleteUserProfile: `
    DELETE FROM user_profiles
    WHERE user_id = $1
    RETURNING *
    `,

    searchUsers: `
    SELECT 
        u.id,
        u.username,
        u.email,
        up.first_name,
        up.last_name,
        up.avatar_url,
        up.status_message
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE 
        u.username ILIKE $1 OR
        up.first_name ILIKE $1 OR
        up.last_name ILIKE $1
    LIMIT $2 OFFSET $3
    `,

    updateUserStatus: `
    UPDATE users
    SET 
        status = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `
}

export const messageQueries = {
    createMessage: `
    INSERT INTO messages (chat_id, sender_id, content, type)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,

    getMessagesByChatId: `
    SELECT 
        m.*,
        u.username as sender_username,
        up.avatar_url as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE m.chat_id = $1
    ORDER BY m.created_at DESC
    LIMIT $2 OFFSET $3
    `,

    updateMessage: `
    UPDATE messages
    SET 
        content = $2,
        updated_at = CURRENT_TIMESTAMP,
        is_edited = true
    WHERE id = $1 AND sender_id = $3
    RETURNING *
    `,

    deleteMessage: `
    UPDATE messages
    SET 
        is_deleted = true,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND sender_id = $2
    RETURNING *
    `
}

export const chatQueries = {
    createChat: `
    INSERT INTO chats (name, type, created_by)
    VALUES ($1, $2, $3)
    RETURNING *
    `,

    addChatMember: `
    INSERT INTO chat_members (chat_id, user_id, role)
    VALUES ($1, $2, $3)
    RETURNING *
    `,

    getChatMembers: `
    SELECT 
        cm.*,
        u.username,
        u.email,
        up.first_name,
        up.last_name,
        up.avatar_url
    FROM chat_members cm
    JOIN users u ON cm.user_id = u.id
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE cm.chat_id = $1
    `,

    getUserChats: `
    SELECT 
        c.*,
        cm.role as member_role,
        (
            SELECT json_build_object(
                'id', m.id,
                'content', m.content,
                'sender_id', m.sender_id,
                'created_at', m.created_at
            )
            FROM messages m
            WHERE m.chat_id = c.id
            ORDER BY m.created_at DESC
            LIMIT 1
        ) as last_message,
        (
            SELECT COUNT(*)
            FROM messages m
            WHERE m.chat_id = c.id
        ) as message_count
    FROM chats c
    JOIN chat_members cm ON c.id = cm.chat_id
    WHERE cm.user_id = $1
    ORDER BY c.updated_at DESC
    `,

    updateChat: `
    UPDATE chats
    SET 
        name = COALESCE($2, name),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,

    deleteChatMember: `
    DELETE FROM chat_members
    WHERE chat_id = $1 AND user_id = $2
    RETURNING *
    `
}

export const callQueries = {
    createCall: `
    INSERT INTO calls (caller_id, receiver_id, type, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,

    updateCallStatus: `
    UPDATE calls
    SET 
        status = $2,
        ended_at = CASE WHEN $2 IN ('ended', 'missed', 'rejected') THEN CURRENT_TIMESTAMP ELSE ended_at END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,

    getCallHistory: `
    SELECT 
        c.*,
        u1.username as caller_username,
        u2.username as receiver_username,
        up1.avatar_url as caller_avatar,
        up2.avatar_url as receiver_avatar
    FROM calls c
    JOIN users u1 ON c.caller_id = u1.id
    JOIN users u2 ON c.receiver_id = u2.id
    LEFT JOIN user_profiles up1 ON u1.id = up1.user_id
    LEFT JOIN user_profiles up2 ON u2.id = up2.user_id
    WHERE c.caller_id = $1 OR c.receiver_id = $1
    ORDER BY c.created_at DESC
    LIMIT $2 OFFSET $3
    `,

    getActiveCall: `
    SELECT 
        c.*,
        u1.username as caller_username,
        u2.username as receiver_username
    FROM calls c
    JOIN users u1 ON c.caller_id = u1.id
    JOIN users u2 ON c.receiver_id = u2.id
    WHERE (c.caller_id = $1 OR c.receiver_id = $1)
    AND c.status = 'ongoing'
    LIMIT 1
    `,

    getCallById: `
    SELECT 
        c.*,
        u1.username as caller_username,
        u2.username as receiver_username,
        up1.avatar_url as caller_avatar,
        up2.avatar_url as receiver_avatar
    FROM calls c
    JOIN users u1 ON c.caller_id = u1.id
    JOIN users u2 ON c.receiver_id = u2.id
    LEFT JOIN user_profiles up1 ON u1.id = up1.user_id
    LEFT JOIN user_profiles up2 ON u2.id = up2.user_id
    WHERE c.id = $1
    AND (c.caller_id = $2 OR c.receiver_id = $2)
    LIMIT 1
    `,

    getUserRole: `
    SELECT role 
    FROM users
    WHERE id = $1
    LIMIT 1
    `,

    deleteCall: `
    DELETE FROM calls
    WHERE id = $1
    RETURNING id
    `
}

export const userProfileQueries = {
    getAllProfiles: `
    SELECT 
        up.*,
        u.username,
        u.email,
        u.status as user_status,
        u.role as user_role
    FROM user_profiles up
    JOIN users u ON up.user_id = u.id
    WHERE u.status = 'active'
    `,

    getUserProfile: `
    SELECT 
        up.*,
        u.username,
        u.email,
        u.status as user_status,
        u.role as user_role
    FROM user_profiles up
    JOIN users u ON up.user_id = u.id
    WHERE up.user_id = $1
    `,

    updateUserProfile: `
    UPDATE user_profiles 
    SET first_name = $2, 
        last_name = $3, 
        phone_number = $4, 
        address = $5, 
        avatar_url = $6, 
        status_message = $7, 
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *
    `,

    createUserProfile: `
    INSERT INTO user_profiles (
        user_id, 
        first_name, 
        last_name, 
        phone_number, 
        address, 
        avatar_url,
        status_message,
        created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
    `,

    deleteUserProfile: `
    DELETE FROM user_profiles
    WHERE user_id = $1
    RETURNING *
    `
};

