const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Identity } = require('./models');

// Store active users: userId -> { socketId, identityId, context }
const activeUsers = new Map();

function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // ============ MIDDLEWARE ============
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Missing auth token'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      socket.userId = decoded.userId;  // JWT is signed with { userId }, not { id }
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  // ============ CONNECTION HANDLERS ============
  io.on('connection', (socket) => {
    console.log(`✓ User ${socket.userId} connected (socket: ${socket.id})`);

    // User joins a context
    socket.on('join_context', ({ context }) => {
      const roomName = `${socket.userId}:${context}`;
      socket.join(roomName);
      activeUsers.set(socket.id, { userId: socket.userId, context, socketId: socket.id });
      console.log(`  ├─ Joined room: ${roomName}`);
    });

    // Broadcast typing indicator
    socket.on('typing', ({ recipientIdentityId, context }) => {
      const recipients = io.sockets.sockets.values();
      for (const recipientSocket of recipients) {
        if (recipientSocket.userId !== socket.userId) {
          recipientSocket.emit('typing', { senderIdentityId: recipientIdentityId });
        }
      }
    });

    // Receive and forward message to recipient's room
    socket.on('send_message', async (messageData) => {
      const { recipientIdentityId, message, context, id, senderIdentityId, senderUserId, createdAt } = messageData;

      try {
        // Look up recipient's userId from their identityId
        const recipientIdentity = await Identity.findById(recipientIdentityId).select('userId');
        if (!recipientIdentity) return;

        const recipientRoom = `${recipientIdentity.userId}:${context}`;
        io.to(recipientRoom).emit('new_message', {
          id,
          senderUserId,
          senderIdentityId,
          message,
          createdAt,
        });

        console.log(`  ├─ Message delivered to room ${recipientRoom}`);
      } catch (err) {
        console.error('  ├─ Error delivering message:', err.message);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      activeUsers.delete(socket.id);
      console.log(`✗ User ${socket.userId} disconnected (socket: ${socket.id})`);
    });

    socket.on('error', (error) => {
      console.error(`  ├─ Socket error: ${error}`);
    });
  });

  return io;
}

module.exports = { setupSocket, activeUsers };
