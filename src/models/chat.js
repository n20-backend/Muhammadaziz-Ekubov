import { DataTypes } from "sequelize";
import User from "./user.js";

export default (sequelize) => {
    const Chat = sequelize.define("Chat", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            field: "id",
        },
        type: {
            type: DataTypes.ENUM("private", "group"),
            defaultValue: "group",
            field: "type",
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "name",
        },
        ownerId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "ownerId",
            reference: {
                model: User,
                key: "id"
            },
        },
        participants : {
            type: DataTypes.ARRAY(DataTypes.UUID),
            defaultValue: [],
            field: "participants"
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
        tableName: "chat",
        timestamps: true,
        paranoid: true,
        underscored: true,
    });
    return Chat;
}