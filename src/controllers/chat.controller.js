import { chatService } from "../services/chat.service.js";
import logger from "../utils/logger.js";

export const chatController = {
    createChat: async (req, res, next) => {
        try {
            logger.info("Creating chat");
            const chatData = req.body;
            const chat = await chatService.createChat(chatData);
            res.status(201).json(chat);
        } catch (error) {
            logger.error("Error creating chat:", {error: error.message});
            next(error);
        }
    },
    getAllChats: async (req, res, next) => {
        try {
            logger.info("Getting all chats");
            const chats = await chatService.getAllChats();
            res.status(200).json(chats);
        } catch (error) {
            logger.error("Error getting all chats:", {error: error.message});
            next(error);
        }
    },
    getChatById: async (req, res, next) => {
        try {
            logger.info("Getting chat by ID");
            const chatId = req.params.id;
            const chat = await chatService.getChatById(chatId);
            res.status(200).json(chat);
        } catch (error) {
            logger.error("Error getting chat by ID:", {error: error.message});
            next(error);
        }
    },
    updateChat: async (req, res, next) => {
        try {
            logger.info("Updating chat");
            const chatId = req.params.id;
            const chatData = req.body;
            const chat = await chatService.updateChat(chatId, chatData);
            res.status(200).json(chat);
        } catch (error) {
            logger.error("Error updating chat:", {error: error.message});
            next(error);
        }
    },
    deleteChat: async (req, res, next) => {
        try {
            logger.info("Deleting chat");
            const chatId = req.params.id;
            const chat = await chatService.deleteChat(chatId);
            res.status(200).json(chat);
        } catch (error) {
            logger.error("Error deleting chat:", {error: error.message});
            next(error);
        }
    }
};

