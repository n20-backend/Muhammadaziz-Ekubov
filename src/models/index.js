import dotenv from 'dotenv';

// Import the sequelize instance from the database config
import sequelize from '../config/database.js';

// Import model definitions
import defineUserModel from './user.js';
import defineUserProfileModel from './user.profile.js';
import defineChatModel from './chat.js';
import defineMessageModel from './message.js';
import defineCallModel from './call.js';
import defineOTPModel from './otpModel.js';

dotenv.config();

// Initialize models
const User = defineUserModel(sequelize);
const UserProfile = defineUserProfileModel(sequelize);
const Chat = defineChatModel(sequelize);
const Message = defineMessageModel(sequelize);
const Call = defineCallModel(sequelize);
const OTP = defineOTPModel(sequelize);

// Define associations
User.hasOne(UserProfile, { foreignKey: 'userId', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });

User.hasMany(Call, { foreignKey: 'callerId', as: 'madeCallsHistory' });
User.hasMany(Call, { foreignKey: 'receiverId', as: 'receivedCallsHistory' });
Call.belongsTo(User, { foreignKey: 'callerId', as: 'caller' });
Call.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// OTP association with User
User.hasMany(OTP, { foreignKey: 'userId' });
OTP.belongsTo(User, { foreignKey: 'userId' });

// Export models and sequelize instance
// This file provides two ways to import the models:
// 1. Named exports allow importing specific models: import { User, Chat } from './models'
// 2. Default export allows importing everything at once: import db from './models'
export {
  sequelize,
  User,
  UserProfile,
  Chat,
  Message,
  Call,
  OTP
};

export default {
  sequelize,
  User,
  UserProfile,
  Chat,
  Message,
  Call,
  OTP
};
