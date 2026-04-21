const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

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
  isAdmin: {
    type: Boolean,
    default: false
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

// Message Schema - for encrypted messaging
const messageSchema = new mongoose.Schema({
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
  message: {
    type: String,
    required: true
  },
  context: {
    type: String,
    enum: ['professional', 'personal', 'family', 'online'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create index for message queries
messageSchema.index({ senderUserId: 1, recipientUserId: 1, context: 1, createdAt: -1 });
messageSchema.index({ recipientUserId: 1, context: 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);

// Notification Schema - for admin notifications
const notificationSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true
  },
  identityType: {
    type: String,
    enum: ['professional', 'personal', 'family', 'online'],
    required: true
  },
  sentBy: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Create index for notification queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
  User,
  Identity,
  Favorite,
  Friend,
  FriendRequest,
  Message,
  Notification
};
