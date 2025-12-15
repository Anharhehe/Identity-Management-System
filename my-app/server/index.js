const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.'
});

app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Identity Schema
const identitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  legalName: {
    type: String,
    required: [true, 'Legal name is required'],
    trim: true,
    maxlength: [100, 'Legal name cannot exceed 100 characters']
  },
  preferredName: {
    type: String,
    required: [true, 'Preferred name is required'],
    trim: true,
    maxlength: [100, 'Preferred name cannot exceed 100 characters']
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: [100, 'Nickname cannot exceed 100 characters']
  },
  context: {
    type: String,
    enum: ['professional', 'personal', 'family', 'online'],
    required: [true, 'Context type is required']
  },
  accountPrivacy: {
    type: String,
    enum: ['private', 'public'],
    default: 'private',
    required: [true, 'Account privacy is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Identity = mongoose.model('Identity', identitySchema);

// Favorite Schema - stores favorite identities
const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  identityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Identity',
    required: true
  },
  context: {
    type: String,
    enum: ['professional', 'personal', 'family', 'online'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent duplicate favorites
favoriteSchema.index({ userId: 1, identityId: 1, context: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

// Friend Schema - stores friend relationships
const friendSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  friendIdentityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Identity',
    required: true
  },
  context: {
    type: String,
    enum: ['professional', 'personal', 'family', 'online'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent duplicate friendships
friendSchema.index({ userId: 1, friendIdentityId: 1, context: 1 }, { unique: true });

const Friend = mongoose.model('Friend', friendSchema);

// FriendRequest Schema - stores pending friend requests
const friendRequestSchema = new mongoose.Schema({
  senderUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderIdentityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Identity',
    required: true
  },
  recipientUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientIdentityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Identity',
    required: true
  },
  context: {
    type: String,
    enum: ['professional', 'personal', 'family', 'online'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent duplicate requests
friendRequestSchema.index({ senderIdentityId: 1, recipientIdentityId: 1, context: 1 }, { unique: true });

const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Validation middleware for registration
const validateRegistration = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  
  const errors = [];
  
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  // Password strength validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (password && !passwordRegex.test(password)) {
    errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// Validation middleware for identity
const validateIdentity = (req, res, next) => {
  const { legalName, preferredName, context, accountPrivacy } = req.body;
  
  const errors = [];
  
  if (!legalName || legalName.trim().length < 2) {
    errors.push('Legal name must be at least 2 characters long');
  }
  
  if (!preferredName || preferredName.trim().length < 2) {
    errors.push('Preferred name must be at least 2 characters long');
  }
  
  if (preferredName && /\s/.test(preferredName)) {
    errors.push('Preferred name cannot contain spaces');
  }
  
  if (!context || !['professional', 'personal', 'family', 'online'].includes(context)) {
    errors.push('Context must be one of: professional, personal, family, or online');
  }
  
  if (!accountPrivacy || !['private', 'public'].includes(accountPrivacy)) {
    errors.push('Account privacy must be either private or public');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  next();
};

// ============ AUTH ROUTES ============

// Register user
app.post('/api/auth/register', authLimiter, validateRegistration, async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Create new user
    const user = new User({
      firstName: firstName ? firstName.trim() : '',
      lastName: lastName ? lastName.trim() : '',
      email: email.toLowerCase(),
      password
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ IDENTITY ROUTES ============

// Create new identity profile
app.post('/api/identities', authenticateToken, validateIdentity, async (req, res) => {
  try {
    const { legalName, preferredName, nickname, context, accountPrivacy } = req.body;
    
    // Check if preferred name is already used by a different user (globally unique per user)
    const existingIdentity = await Identity.findOne({ 
      preferredName: preferredName.trim(),
      userId: { $ne: req.userId }
    });
    
    if (existingIdentity) {
      return res.status(400).json({ errors: ['This preferred name is already taken by another user. Please choose a different one.'] });
    }
    
    const identity = new Identity({
      userId: req.userId,
      legalName: legalName.trim(),
      preferredName: preferredName.trim(),
      nickname: nickname ? nickname.trim() : '',
      context,
      accountPrivacy: accountPrivacy || 'private'
    });
    
    await identity.save();
    
    res.status(201).json({
      message: 'Identity profile created successfully',
      identity: {
        id: identity._id,
        legalName: identity.legalName,
        preferredName: identity.preferredName,
        nickname: identity.nickname,
        context: identity.context,
        accountPrivacy: identity.accountPrivacy,
        createdAt: identity.createdAt
      }
    });
    
  } catch (error) {
    console.error('Create identity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all identities for logged-in user
app.get('/api/identities', authenticateToken, async (req, res) => {
  try {
    const identities = await Identity.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    res.json({
      count: identities.length,
      identities: identities.map(identity => ({
        id: identity._id,
        legalName: identity.legalName,
        preferredName: identity.preferredName,
        nickname: identity.nickname,
        context: identity.context,
        accountPrivacy: identity.accountPrivacy,
        createdAt: identity.createdAt,
        updatedAt: identity.updatedAt
      }))
    });
    
  } catch (error) {
    console.error('Get identities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get identity by context
app.get('/api/identities/context/:context', authenticateToken, async (req, res) => {
  try {
    const { context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
    const identity = await Identity.findOne({ userId: req.userId, context });
    
    if (!identity) {
      return res.status(404).json({ error: `No identity found for context: ${context}` });
    }
    
    res.json({
      identity: {
        id: identity._id,
        legalName: identity.legalName,
        preferredName: identity.preferredName,
        nickname: identity.nickname,
        context: identity.context,
        accountPrivacy: identity.accountPrivacy,
        createdAt: identity.createdAt,
        updatedAt: identity.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Get identity by context error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get public identities by context (no authentication required)
app.get('/api/identities/public/:context', async (req, res) => {
  try {
    const { context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
    const identities = await Identity.find({ 
      context, 
      accountPrivacy: 'public' 
    }).sort({ createdAt: -1 });
    
    res.json({
      count: identities.length,
      identities: identities.map(identity => ({
        id: identity._id,
        legalName: identity.legalName,
        preferredName: identity.preferredName,
        nickname: identity.nickname,
        context: identity.context,
        accountPrivacy: identity.accountPrivacy,
        createdAt: identity.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get public identities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all identities by context (public and private) - for search
app.get('/api/identities/all/:context', async (req, res) => {
  try {
    const { context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
    const identities = await Identity.find({ context }).sort({ createdAt: -1 });
    
    res.json({
      count: identities.length,
      identities: identities.map(identity => ({
        id: identity._id,
        legalName: identity.legalName,
        preferredName: identity.preferredName,
        nickname: identity.nickname,
        context: identity.context,
        accountPrivacy: identity.accountPrivacy,
        createdAt: identity.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Get all identities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get identity profile by ID (public endpoint) - MUST come before /:id route
app.get('/api/identities/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const identity = await Identity.findById(id);
    
    if (!identity) {
      return res.status(404).json({ error: 'Identity not found' });
    }
    
    res.json({
      identity: {
        id: identity._id,
        userId: identity.userId,
        legalName: identity.legalName,
        preferredName: identity.preferredName,
        nickname: identity.nickname,
        context: identity.context,
        accountPrivacy: identity.accountPrivacy,
        createdAt: identity.createdAt
      }
    });
    
  } catch (error) {
    console.error('Get identity profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific identity by ID
app.get('/api/identities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const identity = await Identity.findOne({ _id: id, userId: req.userId });
    
    if (!identity) {
      return res.status(404).json({ error: 'Identity not found' });
    }
    
    res.json({
      identity: {
        id: identity._id,
        legalName: identity.legalName,
        preferredName: identity.preferredName,
        nickname: identity.nickname,
        context: identity.context,
        accountPrivacy: identity.accountPrivacy,
        createdAt: identity.createdAt,
        updatedAt: identity.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Get identity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update identity
app.put('/api/identities/:id', authenticateToken, validateIdentity, async (req, res) => {
  try {
    const { id } = req.params;
    const { legalName, preferredName, nickname, context, accountPrivacy } = req.body;
    
    const identity = await Identity.findOne({ _id: id, userId: req.userId });
    
    if (!identity) {
      return res.status(404).json({ error: 'Identity not found' });
    }
    
    // Check if preferred name is already used by a different user
    if (preferredName.trim() !== identity.preferredName) {
      const existingIdentity = await Identity.findOne({ 
        preferredName: preferredName.trim(),
        userId: { $ne: req.userId }
      });
      
      if (existingIdentity) {
        return res.status(400).json({ errors: ['This preferred name is already taken by another user. Please choose a different one.'] });
      }
    }
    
    identity.legalName = legalName.trim();
    identity.preferredName = preferredName.trim();
    identity.nickname = nickname ? nickname.trim() : '';
    identity.context = context;
    identity.accountPrivacy = accountPrivacy || 'private';
    identity.updatedAt = new Date();
    
    await identity.save();
    
    res.json({
      message: 'Identity updated successfully',
      identity: {
        id: identity._id,
        legalName: identity.legalName,
        preferredName: identity.preferredName,
        nickname: identity.nickname,
        context: identity.context,
        accountPrivacy: identity.accountPrivacy,
        createdAt: identity.createdAt,
        updatedAt: identity.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Update identity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all friends for a specific context
app.get('/api/friends/:context', authenticateToken, async (req, res) => {
  try {
    const { context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
    const friends = await Friend.find({
      userId: req.userId,
      context
    }).populate('friendIdentityId').sort({ createdAt: -1 });
    
    const friendIdentities = friends.map(friend => ({
      id: friend.friendIdentityId._id,
      legalName: friend.friendIdentityId.legalName,
      preferredName: friend.friendIdentityId.preferredName,
      nickname: friend.friendIdentityId.nickname,
      context: friend.friendIdentityId.context,
      accountPrivacy: friend.friendIdentityId.accountPrivacy,
      createdAt: friend.createdAt
    }));
    
    res.json({
      count: friendIdentities.length,
      friends: friendIdentities
    });
    
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add friend (follow)
app.post('/api/friends/add', authenticateToken, async (req, res) => {
  try {
    const { friendIdentityId, context } = req.body;
    
    if (!friendIdentityId || !context) {
      return res.status(400).json({ error: 'Friend identity ID and context are required' });
    }
    
    // Create or update friend relationship in database
    const friend = await Friend.findOneAndUpdate(
      { userId: req.userId, friendIdentityId, context },
      { userId: req.userId, friendIdentityId, context },
      { upsert: true, new: true }
    );
    
    res.json({
      message: 'Friend added successfully',
      friend: {
        id: friend._id,
        friendIdentityId: friend.friendIdentityId,
        context: friend.context,
        createdAt: friend.createdAt
      }
    });
    
  } catch (error) {
    console.error('Add friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove friend (unfollow)
app.post('/api/friends/remove', authenticateToken, async (req, res) => {
  try {
    const { friendIdentityId, context } = req.body;
    
    if (!friendIdentityId || !context) {
      return res.status(400).json({ error: 'Friend identity ID and context are required' });
    }
    
    const result = await Friend.findOneAndDelete({
      userId: req.userId,
      friendIdentityId,
      context
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Friend relationship not found' });
    }
    
    res.json({
      message: 'Friend removed successfully',
      friendIdentityId,
      context
    });
    
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get friend requests for a specific context
app.get('/api/friend-requests/:context', authenticateToken, async (req, res) => {
  try {
    const { context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
    // Get recipient's identity for this context
    const recipientIdentity = await Identity.findOne({ userId: req.userId, context });
    if (!recipientIdentity) {
      return res.json({
        count: 0,
        requests: []
      });
    }
    
    // Get pending friend requests for this identity
    const requests = await FriendRequest.find({
      recipientIdentityId: recipientIdentity._id,
      context,
      status: 'pending'
    }).populate('senderIdentityId').sort({ createdAt: -1 });
    
    const friendRequests = requests.map(request => ({
      id: request._id,
      senderIdentityId: request.senderIdentityId._id,
      senderName: request.senderIdentityId.preferredName,
      createdAt: request.createdAt
    }));
    
    res.json({
      count: friendRequests.length,
      requests: friendRequests
    });
    
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send friend request
app.post('/api/friend-requests/send', authenticateToken, async (req, res) => {
  try {
    const { recipientIdentityId, context } = req.body;
    
    if (!recipientIdentityId || !context) {
      return res.status(400).json({ error: 'Recipient identity ID and context are required' });
    }
    
    // Get sender's identity for this context
    const senderIdentity = await Identity.findOne({ userId: req.userId, context });
    if (!senderIdentity) {
      return res.status(400).json({ error: 'You do not have an identity in this context' });
    }
    
    // Get recipient identity and user
    const recipientIdentity = await Identity.findById(recipientIdentityId);
    if (!recipientIdentity) {
      return res.status(404).json({ error: 'Recipient identity not found' });
    }
    
    // Create friend request
    const friendRequest = await FriendRequest.findOneAndUpdate(
      { 
        senderIdentityId: senderIdentity._id, 
        recipientIdentityId, 
        context 
      },
      { 
        senderUserId: req.userId,
        senderIdentityId: senderIdentity._id,
        recipientUserId: recipientIdentity.userId,
        recipientIdentityId,
        context,
        status: 'pending'
      },
      { upsert: true, new: true }
    );
    
    res.json({
      message: 'Friend request sent successfully',
      friendRequest: {
        id: friendRequest._id,
        recipientIdentityId: friendRequest.recipientIdentityId,
        context: friendRequest.context,
        createdAt: friendRequest.createdAt
      }
    });
    
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept friend request
app.post('/api/friend-requests/accept', authenticateToken, async (req, res) => {
  try {
    const { requestId, context } = req.body;
    
    if (!requestId || !context) {
      return res.status(400).json({ error: 'Request ID and context are required' });
    }
    
    // Get the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    // Verify the current user is the recipient
    if (friendRequest.recipientUserId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'You are not the recipient of this request' });
    }
    
    // Create bidirectional friendships
    // Sender follows recipient
    await Friend.findOneAndUpdate(
      { userId: friendRequest.senderUserId, friendIdentityId: friendRequest.recipientIdentityId, context },
      { userId: friendRequest.senderUserId, friendIdentityId: friendRequest.recipientIdentityId, context },
      { upsert: true, new: true }
    );
    
    // Recipient follows sender
    await Friend.findOneAndUpdate(
      { userId: friendRequest.recipientUserId, friendIdentityId: friendRequest.senderIdentityId, context },
      { userId: friendRequest.recipientUserId, friendIdentityId: friendRequest.senderIdentityId, context },
      { upsert: true, new: true }
    );
    
    // Update request status to accepted
    friendRequest.status = 'accepted';
    await friendRequest.save();
    
    res.json({
      message: 'Friend request accepted successfully',
      friendRequest: {
        id: friendRequest._id,
        status: friendRequest.status
      }
    });
    
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Decline friend request
app.post('/api/friend-requests/decline', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }
    
    // Get the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    // Verify the current user is the recipient
    if (friendRequest.recipientUserId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'You are not the recipient of this request' });
    }
    
    // Delete the friend request
    await FriendRequest.findByIdAndDelete(requestId);
    
    res.json({
      message: 'Friend request declined successfully',
      requestId
    });
    
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if users are friends
app.get('/api/friends/check/:friendIdentityId/:context', authenticateToken, async (req, res) => {
  try {
    const { friendIdentityId, context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
    // Check if friendship exists
    const friendship = await Friend.findOne({
      userId: req.userId,
      friendIdentityId,
      context
    });
    
    res.json({
      isFriend: !!friendship,
      friendship: friendship ? {
        id: friendship._id,
        createdAt: friendship.createdAt
      } : null
    });
    
  } catch (error) {
    console.error('Check friendship error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============ FAVORITES ROUTES ============

// Get favorites by context
app.get('/api/favorites/:context', authenticateToken, async (req, res) => {
  try {
    const { context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
    const favorites = await Favorite.find({
      userId: req.userId,
      context
    }).populate('identityId').sort({ createdAt: -1 });
    
    const favoriteIdentities = favorites.map(fav => ({
      id: fav.identityId._id,
      legalName: fav.identityId.legalName,
      preferredName: fav.identityId.preferredName,
      nickname: fav.identityId.nickname,
      context: fav.identityId.context,
      accountPrivacy: fav.identityId.accountPrivacy,
      createdAt: fav.createdAt
    }));
    
    res.json({
      count: favoriteIdentities.length,
      favorites: favoriteIdentities
    });
    
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add to favorites
app.post('/api/favorites/:identityId', authenticateToken, async (req, res) => {
  try {
    const { identityId } = req.params;
    const { context } = req.body;
    
    if (!context) {
      return res.status(400).json({ error: 'Context is required' });
    }
    
    const favorite = await Favorite.findOneAndUpdate(
      { userId: req.userId, identityId, context },
      { userId: req.userId, identityId, context },
      { upsert: true, new: true }
    );
    
    res.json({
      message: 'Added to favorites',
      favorite: {
        id: favorite._id,
        identityId: favorite.identityId,
        context: favorite.context,
        createdAt: favorite.createdAt
      }
    });
    
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove from favorites
app.delete('/api/favorites/:identityId', authenticateToken, async (req, res) => {
  try {
    const { identityId } = req.params;
    
    const result = await Favorite.findOneAndDelete({
      userId: req.userId,
      identityId
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Favorite not found' });
    }
    
    res.json({
      message: 'Removed from favorites',
      identityId
    });
    
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete identity
app.delete('/api/identities/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const identity = await Identity.findOneAndDelete({ _id: id, userId: req.userId });
    
    if (!identity) {
      return res.status(404).json({ error: 'Identity not found' });
    }
    
    res.json({
      message: 'Identity deleted successfully',
      identity: {
        id: identity._id,
        context: identity.context
      }
    });
    
  } catch (error) {
    console.error('Delete identity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});