import { DataTypes } from "sequelize";
import Chat from "./chat.js";
import User from "./user.js";

export default (sequelize) => {
    const Message = sequelize.define("Message", {
        id: {
            type: DataTypes.UUID,
            toDefaultValue: DataTypes.UUIDV4,
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
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "sender_id",
            reference: {
                model: User,
                key: "id",
            },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: "content",
        },
        type: {
            type: DataTypes.ENUM("text", "image", "video", "file"),
            allowNull: false,
            field: "type",
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
            field: "created_at",
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
            field: "updated_at",
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
            field: "deleted_at",
        },
    }, {
        tableName: "messages",
        timestamps: true,
        paranoid: true,
        underscored: true,
    });
    return Message;
};