import db from "../db/connection.js";
import logger from "../utils/logger.js";
import errorHandler from "../utils/errorHandler.js";

const messageService = {
    sendMessage: async (userId, messageData) => {
        try {
            // Validate message data
            if (!messageData.chatId) {
                throw errorHandler.badRequest("Chat ID is required");
            }

            if (!messageData.content || messageData.content.trim() === '') {
                throw errorHandler.badRequest("Message content is required");
            }

            if (!messageData.type || !['text', 'image', 'file'].includes(messageData.type)) {
                throw errorHandler.badRequest("Invalid message type");
            }

            // Check if user is a participant in the chat
            const chatQuery = `
                SELECT * FROM chats
                WHERE id = $1
                LIMIT 1
            `;
            const chatResult = await db.query(chatQuery, [messageData.chatId]);
            
            if (chatResult.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }
            
            const chat = chatResult.rows[0];
            
            if (!chat.participants.includes(userId)) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }

            // Create the message
            const query = `
                INSERT INTO messages (chat_id, sender_id, content, type)
                VALUES ($1, $2, $3, $4)
                RETURNING id, chat_id, sender_id, content, type, created_at, updated_at
            `;
            const result = await db.query(query, [
                messageData.chatId,
                userId,
                messageData.content,
                messageData.type
            ]);

            // Update the chat's updated_at timestamp
            const updateChatQuery = `
                UPDATE chats
                SET updated_at = NOW()
                WHERE id = $1
            `;
            await db.query(updateChatQuery, [messageData.chatId]);

            // Get sender info for the real-time notification
            const userQuery = `
                SELECT username FROM users
                WHERE id = $1
                LIMIT 1
            `;
            const userResult = await db.query(userQuery, [userId]);
            
            // Format the message for real-time notification
            const message = {
                id: result.rows[0].id,
                chatId: result.rows[0].chat_id,
                senderId: result.rows[0].sender_id,
                senderUsername: userResult.rows[0]?.username,
                content: result.rows[0].content,
                type: result.rows[0].type,
                createdAt: result.rows[0].created_at,
                updatedAt: result.rows[0].updated_at
            };
            
            logger.info("Message sent successfully", { messageId: result.rows[0].id });
            
            return {
                messageId: result.rows[0].id,
                message: "Message sent"
            };
        } catch (error) {
            logger.error("Error sending message:", { error: error.message });
            throw error;
        }
    },

    getAllMessages: async (userId, chatId, limit = 50, offset = 0) => {
        try {
            // If chatId is provided, check if user is a participant
            let query;
            let queryParams;
            
            if (chatId) {
                // Check if user is a participant in the chat
                const chatQuery = `
                    SELECT * FROM chats
                    WHERE id = $1
                    LIMIT 1
                `;
                const chatResult = await db.query(chatQuery, [chatId]);
                
                if (chatResult.rows.length === 0) {
                    throw errorHandler.notFound("Chat not found");
                }
                
                const chat = chatResult.rows[0];
                
                if (!chat.participants.includes(userId)) {
                    throw errorHandler.forbidden("You are not a participant in this chat");
                }
                
                // Get messages for specific chat
                query = `
                    SELECT m.id, m.chat_id as "chatId", m.sender_id as "senderId", m.content,
                           m.type, m.created_at as "createdAt", m.updated_at as "updatedAt",
                           u.username as "senderUsername"
                    FROM messages m
                    JOIN users u ON m.sender_id = u.id
                    WHERE m.chat_id = $1
                    ORDER BY m.created_at DESC
                    LIMIT $2 OFFSET $3
                `;
                queryParams = [chatId, limit, offset];
            } else {
                // Get all messages from chats where user is a participant
                query = `
                    SELECT m.id, m.chat_id as "chatId", m.sender_id as "senderId", m.content,
                           m.type, m.created_at as "createdAt", m.updated_at as "updatedAt",
                           u.username as "senderUsername"
                    FROM messages m
                    JOIN users u ON m.sender_id = u.id
                    JOIN chats c ON m.chat_id = c.id
                    WHERE c.participants @> ARRAY[$1]::UUID[]
                    ORDER BY m.created_at DESC
                    LIMIT $2 OFFSET $3
                `;
                queryParams = [userId, limit, offset];
            }
            
            const result = await db.query(query, queryParams);
            
            logger.info("Retrieved messages", { count: result.rows.length, chatId });
            return result.rows;
        } catch (error) {
            logger.error("Error getting messages:", { error: error.message });
            throw error;
        }
    },

    getMessageById: async (messageId, userId) => {
        try {
            const query = `
                SELECT m.id, m.chat_id as "chatId", m.sender_id as "senderId", m.content,
                       m.type, m.created_at as "createdAt", m.updated_at as "updatedAt",
                       u.username as "senderUsername"
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                JOIN chats c ON m.chat_id = c.id
                WHERE m.id = $1
                AND c.participants @> ARRAY[$2]::UUID[]
                LIMIT 1
            `;
            const result = await db.query(query, [messageId, userId]);
            
            if (result.rows.length === 0) {
                throw errorHandler.notFound("Message not found or you don't have access to it");
            }
            
            logger.info("Message retrieved successfully", { messageId });
            return result.rows[0];
        } catch (error) {
            logger.error("Error getting message by ID:", { error: error.message, messageId });
            throw error;
        }
    },

    updateMessageStatus: async (messageId, userId, statusData) => {
        try {
            // Check if message exists and user is a participant in the chat
            const messageQuery = `
                SELECT m.*, c.participants
                FROM messages m
                JOIN chats c ON m.chat_id = c.id
                WHERE m.id = $1
                LIMIT 1
            `;
            const messageResult = await db.query(messageQuery, [messageId]);
            
            if (messageResult.rows.length === 0) {
                throw errorHandler.notFound("Message not found");
            }
            
            const message = messageResult.rows[0];
            
            if (!message.participants.includes(userId)) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }
            
            // Cannot update your own message status
            if (message.sender_id === userId) {
                throw errorHandler.badRequest("Cannot update status of your own message");
            }
            
            // Validate status
            if (!statusData.status || !['read', 'delivered'].includes(statusData.status)) {
                throw errorHandler.badRequest("Invalid status");
            }
            
            // In a real application, you would update a separate message_status table
            // For this example, we'll just return success
            
            logger.info("Message status updated successfully", { messageId, status: statusData.status });
            return {
                messageId,
                message: "Message status updated"
            };
        } catch (error) {
            logger.error("Error updating message status:", { error: error.message, messageId });
            throw error;
        }
    },

    deleteMessage: async (messageId, userId) => {
        try {
            // Check if message exists and user is the sender or admin
            const messageQuery = `
                SELECT m.*
                FROM messages m
                WHERE m.id = $1
                LIMIT 1
            `;
            const messageResult = await db.query(messageQuery, [messageId]);
            
            if (messageResult.rows.length === 0) {
                throw errorHandler.notFound("Message not found");
            }
            
            const message = messageResult.rows[0];
            
            // Only the sender or an admin can delete a message
            if (message.sender_id !== userId) {
                // Check if the user is an admin (in a real app, you'd have roles)
                const userQuery = `
                    SELECT role FROM users
                    WHERE id = $1
                    LIMIT 1
                `;
                const userResult = await db.query(userQuery, [userId]);
                
                if (!userResult.rows[0] || userResult.rows[0].role !== 'admin') {
                    throw errorHandler.forbidden("Only the sender can delete this message");
                }
            }
            
            // Delete the message
            const query = `
                DELETE FROM messages
                WHERE id = $1
                RETURNING *
            `;
            const result = await db.query(query, [messageId]);
            
            logger.info("Message deleted successfully", { messageId });
            return {
                messageId,
                message: "Message deleted"
            };
        } catch (error) {
            logger.error("Error deleting message:", { error: error.message, messageId });
            throw error;
        }
    }
};

export default messageService; 