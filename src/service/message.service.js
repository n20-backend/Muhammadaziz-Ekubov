import db from "../db/connection.js";
import logger  from "../utils/logger.js";
import errorHandler from "../utils/errorHandler.js";
import { messageQueries, chatQueries } from "../utils/queries.js";

const messageService = {
    sendMessage: async (userId, messageData) => {
        try {
            if (!messageData.chatId) {
                throw errorHandler.badRequest("Chat ID is required");
            }

            if (!messageData.content || messageData.content.trim() === '') {
                throw errorHandler.badRequest("Message content is required");
            }

            if (!messageData.type || !['text', 'image', 'file'].includes(messageData.type)) {
                throw errorHandler.badRequest("Invalid message type");
            }

            const chatResult = await db.query(chatQueries.getChatMembers, [messageData.chatId]);
            
            if (chatResult.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }
            
            const isMember = chatResult.rows.some(member => member.user_id === userId);
            if (!isMember) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }

            const result = await db.query(messageQueries.createMessage, [
                messageData.chatId,
                userId,
                messageData.content,
                messageData.type
            ]);

            await db.query(chatQueries.updateChat, [messageData.chatId, null]);

            const userResult = await db.query(authQueries.getUserById, [userId]);
            
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
            if (chatId) {
                const chatResult = await db.query(chatQueries.getChatMembers, [chatId]);
                
                if (chatResult.rows.length === 0) {
                    throw errorHandler.notFound("Chat not found");
                }
                
                const isMember = chatResult.rows.some(member => member.user_id === userId);
                if (!isMember) {
                    throw errorHandler.forbidden("You are not a participant in this chat");
                }
                
                const result = await db.query(messageQueries.getMessagesByChatId, [chatId, limit, offset]);
                
                logger.info("Retrieved messages", { count: result.rows.length, chatId });
                return result.rows;
            } else {
                const userChats = await db.query(chatQueries.getUserChats, [userId]);
                const chatIds = userChats.rows.map(chat => chat.id);
                
                const messages = [];
                for (const chatId of chatIds) {
                    const result = await db.query(messageQueries.getMessagesByChatId, [chatId, limit, offset]);
                    messages.push(...result.rows);
                }
                
                messages.sort((a, b) => b.created_at - a.created_at);
                
                const paginatedMessages = messages.slice(offset, offset + limit);
                
                logger.info("Retrieved messages from all chats", { count: paginatedMessages.length });
                return paginatedMessages;
            }
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
            
            if (message.sender_id === userId) {
                throw errorHandler.badRequest("Cannot update status of your own message");
            }
            
            if (!statusData.status || !['read', 'delivered'].includes(statusData.status)) {
                throw errorHandler.badRequest("Invalid status");
            }

            
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

    updateMessage: async (messageId, userId, content) => {
        try {
            const result = await db.query(messageQueries.updateMessage, [messageId, content, userId]);
            
            if (result.rows.length === 0) {
                throw errorHandler.notFound("Message not found or you don't have permission to edit it");
            }
            
            logger.info("Message updated successfully", { messageId });
            return result.rows[0];
        } catch (error) {
            logger.error("Error updating message:", { error: error.message });
            throw error;
        }
    },

    deleteMessage: async (messageId, userId) => {
        try {
            const result = await db.query(messageQueries.deleteMessage, [messageId, userId]);
            
            if (result.rows.length === 0) {
                throw errorHandler.notFound("Message not found or you don't have permission to delete it");
            }
            
            logger.info("Message deleted successfully", { messageId });
            return {
                messageId,
                message: "Message deleted successfully"
            };
        } catch (error) {
            logger.error("Error deleting message:", { error: error.message });
            throw error;
        }
    }
};

export default messageService; 