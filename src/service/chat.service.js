import db from "../db/connection.js";
import logger from "../utils/logger.js";
import errorHandler from "../utils/errorHandler.js";

const chatService = {
    createChat: async (userId, chatData) => {
        try {
            // Validate chat data
            if (!chatData.type || !['private', 'group'].includes(chatData.type)) {
                throw errorHandler.badRequest("Invalid chat type");
            }

            if (!chatData.participants || !Array.isArray(chatData.participants) || chatData.participants.length === 0) {
                throw errorHandler.badRequest("Participants are required");
            }

            // For private chat, ensure there are exactly 2 participants
            if (chatData.type === 'private' && chatData.participants.length !== 2) {
                throw errorHandler.badRequest("Private chat must have exactly 2 participants");
            }

            // For group chat, ensure there's a name
            if (chatData.type === 'group' && (!chatData.name || chatData.name.trim() === '')) {
                throw errorHandler.badRequest("Group chat must have a name");
            }

            // Ensure the current user is included in participants
            if (!chatData.participants.includes(userId)) {
                chatData.participants.push(userId);
            }

            // Check if a private chat already exists between these users
            if (chatData.type === 'private') {
                const checkQuery = `
                    SELECT * FROM chats
                    WHERE type = 'private'
                    AND participants @> $1::UUID[]
                    AND array_length(participants, 1) = 2
                `;
                const checkResult = await db.query(checkQuery, [chatData.participants]);
                
                if (checkResult.rows.length > 0) {
                    return {
                        id: checkResult.rows[0].id,
                        message: "Chat already exists"
                    };
                }
            }

            // Create the chat
            const query = `
                INSERT INTO chats (type, name, owner_id, participants)
                VALUES ($1, $2, $3, $4)
                RETURNING id, type, name, owner_id, participants, created_at, updated_at
            `;
            const result = await db.query(query, [
                chatData.type,
                chatData.name || null,
                chatData.type === 'group' ? userId : null,
                chatData.participants
            ]);

            const newChat = result.rows[0];

            logger.info("Chat created successfully", { chatId: newChat.id });
            
            return {
                chatId: newChat.id,
                message: "Chat created"
            };
        } catch (error) {
            logger.error("Error creating chat:", { error: error.message });
            throw error;
        }
    },

    getAllChats: async (userId) => {
        try {
            const query = `
                SELECT c.id, c.type, c.name, c.owner_id as "ownerId", c.participants,
                       c.created_at as "createdAt", c.updated_at as "updatedAt"
                FROM chats c
                WHERE c.participants @> ARRAY[$1]::UUID[]
                ORDER BY c.updated_at DESC
            `;
            const result = await db.query(query, [userId]);
            
            logger.info("Retrieved all chats for user", { userId, count: result.rows.length });
            return result.rows;
        } catch (error) {
            logger.error("Error getting all chats:", { error: error.message });
            throw error;
        }
    },

    getChatById: async (chatId, userId) => {
        try {
            const query = `
                SELECT c.id, c.type, c.name, c.owner_id as "ownerId", c.participants,
                       c.created_at as "createdAt", c.updated_at as "updatedAt"
                FROM chats c
                WHERE c.id = $1
                AND c.participants @> ARRAY[$2]::UUID[]
                LIMIT 1
            `;
            const result = await db.query(query, [chatId, userId]);
            
            if (result.rows.length === 0) {
                throw errorHandler.notFound("Chat not found or you don't have access to it");
            }
            
            logger.info("Chat retrieved successfully", { chatId });
            return result.rows[0];
        } catch (error) {
            logger.error("Error getting chat by ID:", { error: error.message, chatId });
            throw error;
        }
    },

    updateChat: async (chatId, userId, chatData) => {
        try {
            // Get current chat data
            const getChatQuery = `
                SELECT * FROM chats
                WHERE id = $1
                LIMIT 1
            `;
            const chatResult = await db.query(getChatQuery, [chatId]);
            
            if (chatResult.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }
            
            const chat = chatResult.rows[0];
            
            // Check if user is a participant in the chat
            if (!chat.participants.includes(userId)) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }
            
            // For group chats, only owner can update
            if (chat.type === 'group' && chat.owner_id !== userId) {
                throw errorHandler.forbidden("Only the owner can update a group chat");
            }
            
            // For private chats, only participants can update and only certain fields
            if (chat.type === 'private' && chatData.name) {
                throw errorHandler.badRequest("Cannot change name of a private chat");
            }

            // Update chat
            let updateQuery = 'UPDATE chats SET ';
            const queryParams = [];
            let paramCounter = 1;
            
            const updateFields = [];
            
            if (chatData.name && chatData.name.trim() !== '' && chat.type === 'group') {
                updateFields.push(`name = $${paramCounter++}`);
                queryParams.push(chatData.name);
            }
            
            if (chatData.participants && Array.isArray(chatData.participants) && chatData.participants.length > 0) {
                // Ensure owner is always a participant in group chat
                if (chat.type === 'group' && !chatData.participants.includes(chat.owner_id)) {
                    chatData.participants.push(chat.owner_id);
                }
                
                // For private chat, ensure there are exactly 2 participants
                if (chat.type === 'private' && chatData.participants.length !== 2) {
                    throw errorHandler.badRequest("Private chat must have exactly 2 participants");
                }
                
                updateFields.push(`participants = $${paramCounter++}`);
                queryParams.push(chatData.participants);
            }
            
            updateFields.push(`updated_at = NOW()`);
            
            if (updateFields.length === 1) {
                return {
                    chatId: chat.id,
                    message: "No changes made"
                };
            }
            
            updateQuery += updateFields.join(', ');
            updateQuery += ` WHERE id = $${paramCounter} RETURNING id, type, name, owner_id, participants, created_at, updated_at`;
            queryParams.push(chatId);
            
            const result = await db.query(updateQuery, queryParams);
            
            const updatedChat = result.rows[0];

            logger.info("Chat updated successfully", { chatId });
            return {
                chatId: updatedChat.id,
                message: "Chat updated"
            };
        } catch (error) {
            logger.error("Error updating chat:", { error: error.message, chatId });
            throw error;
        }
    },

    deleteChat: async (chatId, userId) => {
        try {
            // Get current chat data
            const getChatQuery = `
                SELECT * FROM chats
                WHERE id = $1
                LIMIT 1
            `;
            const chatResult = await db.query(getChatQuery, [chatId]);
            
            if (chatResult.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }
            
            const chat = chatResult.rows[0];
            
            // Check if user is a participant in the chat
            if (!chat.participants.includes(userId)) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }
            
            // For group chats, only owner or admin can delete
            if (chat.type === 'group' && chat.owner_id !== userId) {
                // Check if user is admin
                const userQuery = `
                    SELECT role FROM users
                    WHERE id = $1
                    LIMIT 1
                `;
                const userResult = await db.query(userQuery, [userId]);
                
                if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
                    throw errorHandler.forbidden("Only the owner or an admin can delete a group chat");
                }
            }
            
            // Delete chat
            const deleteQuery = `
                DELETE FROM chats
                WHERE id = $1
                RETURNING id
            `;
            await db.query(deleteQuery, [chatId]);
            
            logger.info("Chat deleted successfully", { chatId });
            return { message: "Chat deleted" };
        } catch (error) {
            logger.error("Error deleting chat:", { error: error.message, chatId });
            throw error;
        }
    }
};

export default chatService; 