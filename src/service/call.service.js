import db from "../db/connection.js";
import logger from "../utils/logger.js";
import errorHandler from "../utils/errorHandler.js";
import { callQueries, chatQueries } from "../utils/queries.js";

const callService = {
    startCall: async (userId, callData) => {
        try {
            
            if (!callData.chatId) {
                throw errorHandler.badRequest("Chat ID is required");
            }

            if (!callData.receiverId) {
                throw errorHandler.badRequest("Receiver ID is required");
            }

            t
            const chatMembers = await db.query(chatQueries.getChatMembers, [callData.chatId]);
            
            if (chatMembers.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }
            
            const isCaller = chatMembers.rows.some(member => member.user_id === userId);
            const isReceiver = chatMembers.rows.some(member => member.user_id === callData.receiverId);
            
            if (!isCaller) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }

            if (!isReceiver) {
                throw errorHandler.badRequest("Receiver is not a participant in this chat");
            }

            
            const activeCall = await db.query(callQueries.getActiveCall, [userId]);
            if (activeCall.rows.length > 0) {
                throw errorHandler.conflict("You already have an ongoing call");
            }

            const receiverActiveCall = await db.query(callQueries.getActiveCall, [callData.receiverId]);
            if (receiverActiveCall.rows.length > 0) {
                throw errorHandler.conflict("Receiver is already in a call");
            }

            
            const result = await db.query(callQueries.createCall, [
                userId,
                callData.receiverId,
                'video',  // or could be passed in callData
                'ongoing'
            ]);

            const call = result.rows[0];

            logger.info("Call started successfully", { callId: call.id });
            
            return {
                callId: call.id,
                message: "Call started"
            };
        } catch (error) {
            logger.error("Error starting call:", { error: error.message });
            throw error;
        }
    },

    getAllCalls: async (userId, limit = 50, offset = 0) => {
        try {
            const result = await db.query(callQueries.getCallHistory, [userId, limit, offset]);
            
            logger.info("Retrieved all calls for user", { userId, count: result.rows.length });
            return result.rows;
        } catch (error) {
            logger.error("Error getting all calls:", { error: error.message });
            throw error;
        }
    },

    getActiveCall: async (userId) => {
        try {
            const result = await db.query(callQueries.getActiveCall, [userId]);
            
            if (result.rows.length === 0) {
                return null;
            }
            
            logger.info("Active call retrieved successfully", { callId: result.rows[0].id });
            return result.rows[0];
        } catch (error) {
            logger.error("Error getting active call:", { error: error.message });
            throw error;
        }
    },

    updateCallStatus: async (callId, userId, status) => {
        try {
            
            const activeCall = await db.query(callQueries.getActiveCall, [userId]);
            
            if (activeCall.rows.length === 0 || activeCall.rows[0].id !== callId) {
                throw errorHandler.notFound("Call not found or already ended");
            }
            
            const call = activeCall.rows[0];
            
            
            if (call.caller_id !== userId && call.receiver_id !== userId) {
                throw errorHandler.forbidden("You are not a participant in this call");
            }

            
            const result = await db.query(callQueries.updateCallStatus, [callId, status]);
            
            logger.info("Call status updated successfully", { callId, status });
            return {
                callId: result.rows[0].id,
                message: `Call ${status}`
            };
        } catch (error) {
            logger.error("Error updating call status:", { error: error.message });
            throw error;
        }
    },

    endCall: async (callId, userId) => {
        return await callService.updateCallStatus(callId, userId, 'ended');
    },

    rejectCall: async (callId, userId) => {
        return await callService.updateCallStatus(callId, userId, 'rejected');
    },

    missCall: async (callId, userId) => {
        return await callService.updateCallStatus(callId, userId, 'missed');
    },

    getCallById: async (callId, userId) => {
        try {
            const query = `
                SELECT c.id, c.chat_id as "chatId", c.caller_id as "callerId", c.receiver_id as "receiverId",
                       c.start_time as "startTime", c.end_time as "endTime", c.status,
                       u1.username as "callerUsername", u2.username as "receiverUsername"
                FROM calls c
                JOIN users u1 ON c.caller_id = u1.id
                JOIN users u2 ON c.receiver_id = u2.id
                WHERE c.id = $1
                AND (c.caller_id = $2 OR c.receiver_id = $2)
                LIMIT 1
            `;
            const result = await db.query(query, [callId, userId]);
            
            if (result.rows.length === 0) {
                throw errorHandler.notFound("Call not found or you don't have access to it");
            }
            
            logger.info("Call retrieved successfully", { callId });
            return result.rows[0];
        } catch (error) {
            logger.error("Error getting call by ID:", { error: error.message, callId });
            throw error;
        }
    },

    deleteCall: async (callId, userId) => {
        try {
            // Check if call exists
            const callQuery = `
                SELECT * FROM calls
                WHERE id = $1
                LIMIT 1
            `;
            const callResult = await db.query(callQuery, [callId]);
            
            if (callResult.rows.length === 0) {
                throw errorHandler.notFound("Call not found");
            }
            
            const call = callResult.rows[0];
            
            // Only caller, receiver or admin can delete the call
            if (call.caller_id !== userId && call.receiver_id !== userId) {
                // Check if user is admin
                const userQuery = `
                    SELECT role FROM users
                    WHERE id = $1
                    LIMIT 1
                `;
                const userResult = await db.query(userQuery, [userId]);
                
                if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
                    throw errorHandler.forbidden("You are not authorized to delete this call");
                }
            }

            // Delete the call
            const query = `
                DELETE FROM calls
                WHERE id = $1
                RETURNING id
            `;
            await db.query(query, [callId]);
            
            logger.info("Call deleted successfully", { callId });
            return { message: "Call deleted" };
        } catch (error) {
            logger.error("Error deleting call:", { error: error.message, callId });
            throw error;
        }
    }
};

export default callService; 