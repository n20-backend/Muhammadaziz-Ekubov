import logger from "../utils/logger.js";
import chatService from "../service/chat.service.js";

export const chatController = {
    createChat: async (req, res, next) => {
        try {
            logger.info("Creating chat");
            const userId = req.user.id;
            const chatData = req.body;

            const result = await chatService.createChat(userId, chatData);
            
            res.status(201).json(result);
        } catch (error) {
            logger.error("Error creating chat:", { error: error.message });
            next(error);
        }
    },

    getAllChats: async (req, res, next) => {
        try {
            logger.info("Getting all chats");
            const userId = req.user.id;
            
            const chats = await chatService.getAllChats(userId);
            
            res.status(200).json(chats);
        } catch (error) {
            logger.error("Error getting all chats:", { error: error.message });
            next(error);
        }
    },

    getChatById: async (req, res, next) => {
        try {
            const chatId = req.params.id;
            const userId = req.user.id;
            
            logger.info("Getting chat by ID", { chatId });
            
            const chat = await chatService.getChatById(chatId, userId);
            
            res.status(200).json(chat);
        } catch (error) {
            logger.error("Error getting chat by ID:", { error: error.message });
            next(error);
        }
    },

    updateChat: async (req, res, next) => {
        try {
            const chatId = req.params.id;
            const userId = req.user.id;
            const chatData = req.body;
            
            logger.info("Updating chat", { chatId });
            
            const result = await chatService.updateChat(chatId, userId, chatData);
            
            res.status(200).json(result);
        } catch (error) {
            logger.error("Error updating chat:", { error: error.message });
            next(error);
        }
    },

    deleteChat: async (req, res, next) => {
        try {
            const chatId = req.params.id;
            const userId = req.user.id;
            
            logger.info("Deleting chat", { chatId });
            
            const result = await chatService.deleteChat(chatId, userId);
            
            res.status(200).json(result);
        } catch (error) {
            logger.error("Error deleting chat:", { error: error.message });
            next(error);
        }
    }
}; 