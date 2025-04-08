import db from "../db/connection.js";
import logger from "../utils/logger.js";
import errorHandler from "../utils/errorHandler.js";

const callService = {
    startCall: async (userId, callData) => {
        try {
            // Validate call data
            if (!callData.chatId) {
                throw errorHandler.badRequest("Chat ID is required");
            }

            if (!callData.receiverId) {
                throw errorHandler.badRequest("Receiver ID is required");
            }

            // Check if user is a participant in the chat
            const chatQuery = `
                SELECT * FROM chats
                WHERE id = $1
                LIMIT 1
            `;
            const chatResult = await db.query(chatQuery, [callData.chatId]);
            
            if (chatResult.rows.length === 0) {
                throw errorHandler.notFound("Chat not found");
            }
            
            const chat = chatResult.rows[0];
            
            if (!chat.participants.includes(userId)) {
                throw errorHandler.forbidden("You are not a participant in this chat");
            }

            // Check if receiver is a participant in the chat
            if (!chat.participants.includes(callData.receiverId)) {
                throw errorHandler.badRequest("Receiver is not a participant in this chat");
            }

            // Check if there's an ongoing call in this chat
            const ongoingCallQuery = `
                SELECT * FROM calls
                WHERE chat_id = $1
                AND status = 'ongoing'
                LIMIT 1
            `;
            const ongoingCallResult = await db.query(ongoingCallQuery, [callData.chatId]);
            
            if (ongoingCallResult.rows.length > 0) {
                throw errorHandler.conflict("There's already an ongoing call in this chat");
            }

            // Create the call
            const query = `
                INSERT INTO calls (chat_id, caller_id, receiver_id, start_time, status)
                VALUES ($1, $2, $3, NOW(), 'ongoing')
                RETURNING id, chat_id, caller_id, receiver_id, start_time, status
            `;
            const result = await db.query(query, [
                callData.chatId,
                userId,
                callData.receiverId
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

    getAllCalls: async (userId) => {
        try {
            const query = `
                SELECT c.id, c.chat_id as "chatId", c.caller_id as "callerId", c.receiver_id as "receiverId",
                       c.start_time as "startTime", c.end_time as "endTime", c.status,
                       u1.username as "callerUsername", u2.username as "receiverUsername"
                FROM calls c
                JOIN users u1 ON c.caller_id = u1.id
                JOIN users u2 ON c.receiver_id = u2.id
                WHERE c.caller_id = $1 OR c.receiver_id = $1
                ORDER BY c.start_time DESC
            `;
            const result = await db.query(query, [userId]);
            
            logger.info("Retrieved all calls for user", { userId, count: result.rows.length });
            return result.rows;
        } catch (error) {
            logger.error("Error getting all calls:", { error: error.message });
            throw error;
        }
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

    endCall: async (callId, userId) => {
        try {
            // Check if call exists and user is a participant
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
            
            // Only caller or receiver can end the call
            if (call.caller_id !== userId && call.receiver_id !== userId) {
                throw errorHandler.forbidden("You are not a participant in this call");
            }
            
            // Cannot end a call that is already ended or missed
            if (call.status !== 'ongoing') {
                throw errorHandler.badRequest(`Call is already ${call.status}`);
            }

            // End the call
            const query = `
                UPDATE calls
                SET status = 'ended', end_time = NOW()
                WHERE id = $1
                RETURNING id, chat_id, caller_id, receiver_id, start_time, end_time, status
            `;
            const result = await db.query(query, [callId]);
            
            const updatedCall = result.rows[0];

            logger.info("Call ended successfully", { callId });
            return {
                callId: updatedCall.id,
                message: "Call ended"
            };
        } catch (error) {
            logger.error("Error ending call:", { error: error.message, callId });
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