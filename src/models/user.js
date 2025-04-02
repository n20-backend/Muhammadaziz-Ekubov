import { DataTypes } from "sequelize";


export default (sequelize) => {
    const Users = sequelize.define("Users", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            field: "id",
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: "email",
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            field: "username",
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            field: "password",
        },
        role: {
            type: DataTypes.ENUM("user", "admin", "moderator"),
            defaultValue: "user",
            field: "role",
        },
        status: {
            type: DataTypes.ENUM("active", "inactive"),
            defaultValue: "inactive",
            field: "status",
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
        tableName: "users",
        timestamps: true,
        paranoid: true,
    });
    return Users
};
