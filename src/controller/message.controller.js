import logger from "../utils/logger.js";
import messageService from "../service/message.service.js";

export const messageController = {
    sendMessage: async (req, res, next) => {
        try {
            logger.info("Sending message");
            const userId = req.user.id;
            const messageData = req.body;

            const result = await messageService.sendMessage(userId, messageData);
            
            res.status(201).json(result);
        } catch (error) {
            logger.error("Error sending message:", { error: error.message });
            next(error);
        }
    },

    getAllMessages: async (req, res, next) => {
        try {
            logger.info("Getting all messages");
            const userId = req.user.id;
            const { chatId, limit, offset } = req.query;
            
            const messages = await messageService.getAllMessages(
                userId, 
                chatId, 
                limit ? parseInt(limit) : 50, 
                offset ? parseInt(offset) : 0
            );
            
            res.status(200).json(messages);
        } catch (error) {
            logger.error("Error getting all messages:", { error: error.message });
            next(error);
        }
    },

    getMessageById: async (req, res, next) => {
        try {
            const messageId = req.params.id;
            const userId = req.user.id;
            
            logger.info("Getting message by ID", { messageId });
            
            const message = await messageService.getMessageById(messageId, userId);
            
            res.status(200).json(message);
        } catch (error) {
            logger.error("Error getting message by ID:", { error: error.message });
            next(error);
        }
    },

    updateMessageStatus: async (req, res, next) => {
        try {
            const messageId = req.params.id;
            const userId = req.user.id;
            const statusData = req.body;
            
            logger.info("Updating message status", { messageId });
            
            const result = await messageService.updateMessageStatus(messageId, userId, statusData);
            
            res.status(200).json(result);
        } catch (error) {
            logger.error("Error updating message status:", { error: error.message });
            next(error);
        }
    },

    deleteMessage: async (req, res, next) => {
        try {
            const messageId = req.params.id;
            const userId = req.user.id;
            
            logger.info("Deleting message", { messageId });
            
            const result = await messageService.deleteMessage(messageId, userId);
            
            res.status(200).json(result);
        } catch (error) {
            logger.error("Error deleting message:", { error: error.message });
            next(error);
        }
    }
}; 