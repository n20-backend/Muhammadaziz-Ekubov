# Chat Application

A real-time chat application built with Node.js, featuring user authentication, messaging, and chat room functionality.

## Project Structure

/backend
├── /config                                 # Configuration files
│   ├── db.js                               # Database connection configuration
│   ├── jwt.js                              # JWT configuration
│   ├── socket.js                           # WebSocket configuration  
│   └── cas bin.js                          # Cas bin authorization configuration
├── /controllers                            # Application controllers
│   ├── chatController.js                   # Handle chat-related logic
│   ├── messageController.js                # Manage messages
│   └── userController.js                   # Handle user authentication and actions
├── /models                                 # Database models
│   ├── chatModel.js                        # Chat schema definition
│   ├── messageModel.js                     # Message schema definition
│   └── userModel.js                        # User schema definition
├── /routes                                 # API route definitions
│   ├── chatRoutes.js                       # Routes for chat operations
│   ├── messageRoutes.js                    # Routes for messages
│   └── userRoutes.js                       # Routes for user actions
├── /migrations                             # Database migrations
│   ├── createTables.sql                    # SQL migrations for database
│   ├── 20250301_add_roles.sql              # Add role tables migration
│   └── migrate.js                          # Migration execution script
├── /services                               # Service layer
│   ├── auth.service.js                     # Authentication service
│   ├── chat.service.js                     # Chat functionality service
│   ├── message.service.js                  # Message handling service
│   ├── permission.service.js               # Permission management
│   ├── socket.service.js                   # WebSocket functionality
│   └── token.service.js                    # JWT token management
├── /middleware                             # Express middleware
│   ├── auth.middleware.js                  # Authentication middleware
│   ├── error.middleware.js                 # Error handling middleware
│   ├── permission.middleware.js            # Permission checks
│   ├── rateLimit.middleware.js             # Rate limiting
│   ├── cas bin.middleware.js               # Cas bin authorization middleware
│   └── validation.middleware.js            # Input validation
├── /utils                                  # Utility functions
│   ├── crypto.js                           # Cryptography utilities
│   ├── errorHandler.js                     # Error handling functions
│   └── validator.js                        # Data validation functions
├── /tests                                  # Test files
│   ├── integration                         # Integration tests
│   └── unit                                # Unit tests
├── /rbac                                   # Cas bin RBAC policies and models
│   ├── model.conf                          # Cas bin model configuration
│   └── policy.csv                          # Cas bin policy rules
├── app.js                                  # Main application file
├── server.js                               # Server entry point
├── package.json                            # Project dependencies and scripts
└── .env                                    # Environment variables

## Features

- User authentication and authorization
- Role-based access control (RBAC) using Cas bin
- Real-time messaging using WebSockets
- Chat room creation and management
- Message history and persistence
- Input validation and error handling
- Rate limiting to prevent abuse
# Muhammadaziz-Ekubov
