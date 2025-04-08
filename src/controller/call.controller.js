import logger from "../utils/logger.js";
import callService from "../service/call.service.js";

export const callController = {
    startCall: async (req, res, next) => {
        try {
            logger.info("Starting call");
            const userId = req.user.id;
            const callData = req.body;

            const result = await callService.startCall(userId, callData);
            
            res.status(201).json(result);
        } catch (error) {
            logger.error("Error starting call:", { error: error.message });
            next(error);
        }
    },

    getAllCalls: async (req, res, next) => {
        try {
            logger.info("Getting all calls");
            const userId = req.user.id;
            
            const calls = await callService.getAllCalls(userId);
            
            res.status(200).json(calls);
        } catch (error) {
            logger.error("Error getting all calls:", { error: error.message });
            next(error);
        }
    },

    getCallById: async (req, res, next) => {
        try {
            const callId = req.params.id;
            const userId = req.user.id;
            
            logger.info("Getting call by ID", { callId });
            
            const call = await callService.getCallById(callId, userId);
            
            res.status(200).json(call);
        } catch (error) {
            logger.error("Error getting call by ID:", { error: error.message });
            next(error);
        }
    },

    endCall: async (req, res, next) => {
        try {
            const callId = req.params.id;
            const userId = req.user.id;
            
            logger.info("Ending call", { callId });
            
            const result = await callService.endCall(callId, userId);
            
            res.status(200).json(result);
        } catch (error) {
            logger.error("Error ending call:", { error: error.message });
            next(error);
        }
    },

    deleteCall: async (req, res, next) => {
        try {
            const callId = req.params.id;
            const userId = req.user.id;
            
            logger.info("Deleting call", { callId });
            
            const result = await callService.deleteCall(callId, userId);
            
            res.status(200).json(result);
        } catch (error) {
            logger.error("Error deleting call:", { error: error.message });
            next(error);
        }
    }
}; 