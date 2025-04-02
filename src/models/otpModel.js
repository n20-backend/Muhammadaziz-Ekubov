import { DataTypes } from "sequelize";

export default (sequelize) => {
    const OTP = sequelize.define("OTP", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "user_id",
            references: {
                model: "Users",
                key: "id",
            },
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: "expires_at",
        },
    }, {
        tableName: "otps",
        timestamps: false,
        underscored: true,
    });
    
    return OTP;
};
