import { DataTypes } from "sequelize";
import User from "./user.js";

export default (sequelize) => {
    const UserProfile = sequelize.define( "UserProfile" ,
        {
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                field: "user_id",
                reference: {
                    model: User,
                    key: "id"
                },
            },
            firstName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: "first_name",
                reference: {
                    model: User,
                    key: "firstName"
                },
            },
            lastName: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: "last_name",
                reference: {
                    model: User,
                    key: "lastName"
                },
            },
            avatarUrl: {
                type: DataTypes.STRING,
                allowNull: true,
                field: "avatar_url"
            },
            statusMessage: {
                type: DataTypes.STRING,
                allowNull: true,
                field: "status_Message",
                reference: {
                    model: User,
                    key: "statusMessage"
                },
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
        }, {
            tableName: "user_profiles",
            timestamps: true,
            paranoid: true,
            underscored: true,
        });
    return UserProfile;
};