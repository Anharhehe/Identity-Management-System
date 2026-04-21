require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

// Import config
const connectDB = require('./config/database');

// Import utils
const setupAdmin = require('./utils/setupAdmin');

// Import middleware
const { limiter } = require('./middleware/rateLimiter');

// Import socket setup
const { setupSocket } = require('./socket');

// Import routes
const authRoutes = require('./routes/auth');
const identitiesRoutes = require('./routes/identities');
const friendsRoutes = require('./routes/friends');
const friendRequestsRoutes = require('./routes/friend-requests');
const favoritesRoutes = require('./routes/favorites');
const messagesRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const notificationsRoutes = require('./routes/notifications');
const chatRoutes = require('./routes/chat');

const app = express();
const httpServer = http.createServer(app);

// ============ MIDDLEWARE SETUP ============

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));

// ============ DATABASE CONNECTION ============
connectDB().then(() => {
  setupAdmin();
});

// ============ API ROUTES ============

// Auth routes
app.use('/api/auth', authRoutes);

// Identities routes
app.use('/api/identities', identitiesRoutes);

// Friends routes
app.use('/api/friends', friendsRoutes);

// Friend requests routes
app.use('/api/friend-requests', friendRequestsRoutes);

// Favorites routes
app.use('/api/favorites', favoritesRoutes);

// Messages routes
app.use('/api/messages', messagesRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Notifications routes
app.use('/api/notifications', notificationsRoutes);

// Chat routes (Chatbot)
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ============ ERROR HANDLING ============

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============ SERVER ============

// Initialize socket.io
setupSocket(httpServer);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});
