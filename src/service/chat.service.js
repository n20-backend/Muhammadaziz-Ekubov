import db from "../db/connection.js";
import logger from "../utils/logger.js";
import errorHandler from "../utils/errorHandler.js";
import { chatQueries } from "../utils/queries.js";

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

            // Create the chat
            const result = await db.query(chatQueries.createChat, [
                chatData.name || null,
                chatData.type,
                userId
            ]);

            const newChat = result.rows[0];

            // Add all participants
            for (const participantId of chatData.participants) {
                await db.query(chatQueries.addChatMember, [
                    newChat.id,
                    participantId,
                    participantId === userId ? 'owner' : 'member'
                ]);
            }

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
            const result = await db.query(chatQueries.getUserChats, [userId]);
            
            logger.info("Retrieved all chats for user", { userId, count: result.rows.length });
            return result.rows;
        } catch (error) {
            logger.error("Error getting all chats:", { error: error.message });
            throw error;
        }
    },

    getChatById: async (chatId, userId) => {
        try {
            const result = await db.query(chatQueries.getChatMembers, [chatId]);
            
            if (result.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }

            const isMember = result.rows.some(member => member.user_id === userId);
            if (!isMember) {
                throw errorHandler.forbidden("You don't have access to this chat");
            }
            
            logger.info("Chat retrieved successfully", { chatId });
            return {
                id: chatId,
                members: result.rows,
                type: result.rows[0].chat_type,
                name: result.rows[0].chat_name
            };
        } catch (error) {
            logger.error("Error getting chat by ID:", { error: error.message, chatId });
            throw error;
        }
    },

    updateChat: async (chatId, userId, chatData) => {
        try {
            // Get current chat members
            const membersResult = await db.query(chatQueries.getChatMembers, [chatId]);
            
            if (membersResult.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }
            
            const userMember = membersResult.rows.find(member => member.user_id === userId);
            if (!userMember) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }
            
            // Only owner can update chat name
            if (userMember.role !== 'owner' && chatData.name) {
                throw errorHandler.forbidden("Only the owner can update chat name");
            }

            // Update chat name if provided
            if (chatData.name && chatData.name.trim() !== '') {
                await db.query(chatQueries.updateChat, [chatId, chatData.name]);
            }

            // Update members if provided
            if (chatData.participants && Array.isArray(chatData.participants)) {
                const currentMembers = membersResult.rows.map(m => m.user_id);
                const newMembers = chatData.participants.filter(id => !currentMembers.includes(id));
                const removedMembers = currentMembers.filter(id => !chatData.participants.includes(id));

                // Add new members
                for (const memberId of newMembers) {
                    await db.query(chatQueries.addChatMember, [chatId, memberId, 'member']);
                }

                // Remove members
                for (const memberId of removedMembers) {
                    if (userMember.role === 'owner' || memberId === userId) {
                        await db.query(chatQueries.deleteChatMember, [chatId, memberId]);
                    }
                }
            }

            logger.info("Chat updated successfully", { chatId });
            return {
                chatId: chatId,
                message: "Chat updated"
            };
        } catch (error) {
            logger.error("Error updating chat:", { error: error.message, chatId });
            throw error;
        }
    },

    deleteChat: async (chatId, userId) => {
        try {
            // Get current chat members
            const membersResult = await db.query(chatQueries.getChatMembers, [chatId]);
            
            if (membersResult.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }
            
            const userMember = membersResult.rows.find(member => member.user_id === userId);
            if (!userMember) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }
            
            // Only owner can delete chat
            if (userMember.role !== 'owner') {
                throw errorHandler.forbidden("Only the owner can delete the chat");
            }
            
            // Delete all members first
            for (const member of membersResult.rows) {
                await db.query(chatQueries.deleteChatMember, [chatId, member.user_id]);
            }
            
            logger.info("Chat deleted successfully", { chatId });
            return {
                chatId: chatId,
                message: "Chat deleted successfully"
            };
        } catch (error) {
            logger.error("Error deleting chat:", { error: error.message, chatId });
            throw error;
        }
    }
};

export default chatService; 