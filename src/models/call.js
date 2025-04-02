import { DataTypes } from "sequelize";
import Chat from "./chat.js";
import User from "./user.js";

export default (sequelize) => {
    const Call = sequelize.define("Call", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            field: "id",
        },
        chatId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "chat_id",
            reference: {
                model: Chat,
                key: "id",
            },
        },
        callerId: {
            id: DataTypes.UUID,
            allowNull: false,
            field: "caller_id",
            reference: {
                model: User,
                key: "id",
            },
        },
        receiverId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "receiver_id",
            reference: {
                model: User,
                key: "id",
            },
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: "start_time",
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
            field: "end_time"
        },
        status: {
            type: DataTypes.ENUM("ongoing", "missed", "ended"),
            defaultValue: "ongoing",
            allowNull: false,
            field: "status"
        },
    }, {
        tableName: "calls",
        timestamps: true,
    });
    return Call
};