# Server Structure Documentation

## Overview
The Express.js server has been refactored from a monolithic `index.js` file into a clean, organized folder structure following industry best practices.

## Folder Structure

```
server/
├── config/
│   └── database.js           # MongoDB connection setup
├── models/
│   └── index.js              # All Mongoose schemas (User, Identity, Friend, etc.)
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   └── rateLimiter.js        # Rate limiting configuration
├── routes/
│   ├── auth.js               # Authentication routes (login, register, profile)
│   ├── identities.js         # Identity management routes (CRUD)
│   ├── friends.js            # Friend/connection management routes
│   ├── favorites.js          # Favorites management routes
│   └── messages.js           # Messaging routes
├── utils/
│   ├── encryption.js         # Message encryption/decryption utilities
│   └── validators.js         # Request validation middleware
├── index.js                  # Main application entry point (clean & organized)
├── package.json              # Dependencies
└── test-connection.js        # Connection test script
```

## File Descriptions

### Config
- **database.js** - Handles MongoDB connection using Mongoose. Exports `connectDB()` function.

### Models
- **index.js** - Exports all Mongoose models:
  - `User` - User accounts
  - `Identity` - User identities (one per context)
  - `Favorite` - Starred/bookmarked identities
  - `Friend` - Friend relationships
  - `FriendRequest` - Pending friend requests
  - `Message` - Encrypted messages

### Middleware
- **auth.js** - JWT token verification and user authentication
- **rateLimiter.js** - Exports general and auth-specific rate limiters

### Routes
- **auth.js** - POST `/register`, `/login`, GET `/profile`, POST `/logout`
- **identities.js** - Full CRUD for identities + context-based queries
- **friends.js** - Friend management and friend request handling
- **favorites.js** - Add/remove/retrieve favorites
- **messages.js** - Send/retrieve/decrypt messages and conversations

### Utils
- **encryption.js** - AES encryption/decryption for messages
- **validators.js** - Input validation for registration and identity creation

### Main Entry Point
- **index.js** - Clean, readable main file that:
  - Imports all modules
  - Sets up middleware
  - Connects to database
  - Mounts all route handlers
  - Handles errors and 404s

## API Routes

All routes are prefixed with `/api`:

### Authentication
- `POST /auth/register` - Create new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile
- `POST /auth/logout` - Logout

### Identities
- `POST /identities` - Create identity
- `GET /identities` - Get all user identities
- `GET /identities/:id` - Get specific identity
- `GET /identities/context/:context` - Get identity by context
- `GET /identities/public/:context` - Get public identities
- `GET /identities/all/:context` - Get all identities (search)
- `GET /identities/profile/:id` - Get identity profile (public)
- `PUT /identities/:id` - Update identity
- `DELETE /identities/:id` - Delete identity

### Friends
- `POST /friends/add` - Add friend
- `POST /friends/remove` - Remove friend
- `GET /friends/check/:friendIdentityId/:context` - Check friendship status
- `GET /friends/:context` - Get friends by context
- `GET /friends/requests/:context` - Get pending requests
- `POST /friends/requests/send` - Send friend request
- `POST /friends/requests/accept` - Accept request
- `POST /friends/requests/decline` - Decline request

### Favorites
- `GET /favorites/:context` - Get favorites by context
- `POST /favorites/:identityId` - Add to favorites
- `DELETE /favorites/:identityId` - Remove from favorites

### Messages
- `POST /messages/send` - Send encrypted message
- `GET /messages/:context/:friendIdentityId` - Get conversation
- `GET /messages/conversations/:context` - Get all conversations

### Health
- `GET /health` - Server health check

## Benefits of This Structure

1. **Scalability** - Easy to add new routes/features
2. **Maintainability** - Clear separation of concerns
3. **Testability** - Each module can be tested independently
4. **Readability** - Easy to find and understand code
5. **Reusability** - Middleware and utilities can be easily shared
6. **Industry Standard** - Follows common Node.js/Express patterns

## Running the Server

```bash
cd my-app/server
npm install
npm start
```

The server will start on the port specified in `.env` (default: 5000).
