import db from "../models/index.js";
import logger from "../utils/logger.js";

export const chatService = {
    createChat: async (chatData) => {
        try {
            logger.info("Creating chat", { type: chatData.type });
            
            if (!['private', 'group'].includes(chatData.type)) {
                throw new Error('Invalid chat type. Must be "private" or "group"');
            }
            
            if (chatData.type === 'group' && !chatData.name) {
                throw new Error('Name is required for group chats');
            }
            
            if (!chatData.participants || !Array.isArray(chatData.participants) || chatData.participants.length < 2) {
                throw new Error('At least two participants are required');
            }
            
            const chat = await db.Chat.create({
                type: chatData.type,
                name: chatData.type === 'group' ? chatData.name : null,
            });
            
            const chatParticipants = chatData.participants.map(userId => ({
                chatId: chat.id,
                userId
            }));
            
            await db.ChatParticipant.bulkCreate(chatParticipants);
            
            logger.info("Chat created successfully", { chatId: chat.id });
            
            return {
                chatId: chat.id,
                message: "Chat created"
            };
        } catch (error) {
            logger.error("Error creating chat:", {error: error.message});
            throw error;
        }
    },
    getAllChats: async () => {
        try {
            const chats = await db.Chat.findAll();
            return chats;
        } catch (error) {
            logger.error("Error getting all chats:", {error: error.message});
            throw error;
        }
    },
    getChatById: async (chatId) => {
        try {
            const chat = await db.Chat.findByPk(chatId, {
                include: [{
                    model: db.ChatParticipant,
                    attributes: ['userId'],
                }]
            });
            
            if (!chat) {
                throw new Error('Chat not found');
            }
            
            return {
                id: chat.id,
                type: chat.type,
                name: chat.name,
                participants: chat.ChatParticipants.map(participant => participant.userId),
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt
            };
        } catch (error) {
            logger.error("Error getting chat by ID:", {error: error.message, chatId});
            throw error;
        }
        try {
            const chat = await db.Chat.findByPk(chatId);
            return chat;
        } catch (error) {
            logger.error("Error getting chat by ID:", {error: error.message});
            throw error;
        }
    },
    updateChat: async (chatId, chatData) => {
        try {
            const chat = await db.Chat.findByPk(chatId);
            if (!chat) {
                throw new Error('Chat not found');
            }
            
            const { name, participants } = chatData;
            
            if (name && chat.type === 'group') {
                await chat.update({ name });
            }
            
            if (participants && Array.isArray(participants)) {
                await db.ChatParticipant.destroy({
                    where: { chatId }
                });
                
                const participantRecords = participants.map(userId => ({
                    chatId,
                    userId
                }));
                
                await db.ChatParticipant.bulkCreate(participantRecords);
            }
            
            logger.info("Chat updated successfully", { chatId });
            
            return {
                chatId: chat.id,
                message: "Chat updated"
            };
        } catch (error) {
            logger.error("Error updating chat:", {error: error.message, chatId});
            throw error;
        }
    },
    deleteChat: async (chatId) => {
        try {
            const chat = await db.Chat.findByPk(chatId);
            if (!chat) {
                throw new Error('Chat not found');
            }
            
            await chat.destroy();
            
            logger.info("Chat deleted successfully", { chatId });
            
            return {
                message: "Chat deleted"
            };
        } catch (error) {
            logger.error("Error deleting chat:", {error: error.message, chatId});
            throw error;
        }
    },    
};
