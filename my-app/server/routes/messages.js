const express = require('express');
const { Message, Identity, Friend, Notification, User } = require('../models');
const { encryptMessage, decryptMessage } = require('../utils/encryption');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientIdentityId, message, context } = req.body;

    if (!recipientIdentityId || !message || !context) {
      return res.status(400).json({ error: 'Recipient identity ID, message, and context are required' });
    }

    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }

    // Get sender's identity for this context
    const senderIdentity = await Identity.findOne({ userId: req.userId, context });
    if (!senderIdentity) {
      return res.status(400).json({ error: 'You do not have an identity in this context' });
    }

    // Get recipient identity
    const recipientIdentity = await Identity.findById(recipientIdentityId);
    if (!recipientIdentity) {
      return res.status(404).json({ error: 'Recipient identity not found' });
    }

    // Check if they are friends
    const friendship = await Friend.findOne({
      userId: req.userId,
      friendIdentityId: recipientIdentityId,
      context
    });

    if (!friendship) {
      return res.status(403).json({ error: 'You are not friends with this user' });
    }

    // Encrypt the message
    const encryptedMessage = encryptMessage(message);

    // Create and save message
    const newMessage = new Message({
      senderUserId: req.userId,
      senderIdentityId: senderIdentity._id,
      recipientUserId: recipientIdentity.userId,
      recipientIdentityId: recipientIdentity._id,
      message: encryptedMessage,
      context,
      isRead: false
    });

    await newMessage.save();

    // Create notification for the recipient
    try {
      const sender = await User.findById(req.userId);
      const messagePreview = message.length > 50 ? message.substring(0, 50) + '...' : message;
      
      await Notification.create({
        userId: recipientIdentity.userId,
        identityId: recipientIdentity._id,
        title: 'New Message',
        message: `${senderIdentity.preferredName} sent you a message: "${messagePreview}"`,
        identityType: context,
        sentBy: sender?.email || 'system',
        isRead: false,
      });
    } catch (notifError) {
      console.error('Error creating message notification:', notifError);
      // Don't fail the request if notification creation fails
    }

    res.json({
      message: 'Message sent successfully',
      messageId: newMessage._id,
      senderIdentityId: newMessage.senderIdentityId,
      createdAt: newMessage.createdAt
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get messages with a specific friend
router.get('/:context/:friendIdentityId', authenticateToken, async (req, res) => {
  try {
    const { context, friendIdentityId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }

    // Get messages between current user and friend
    const messages = await Message.find({
      $or: [
        {
          senderUserId: req.userId,
          recipientIdentityId: friendIdentityId,
          context
        },
        {
          recipientUserId: req.userId,
          senderIdentityId: friendIdentityId,
          context
        }
      ]
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Decrypt messages
    const decryptedMessages = messages.map(msg => ({
      id: msg._id,
      senderUserId: msg.senderUserId,
      senderIdentityId: msg.senderIdentityId,
      recipientUserId: msg.recipientUserId,
      recipientIdentityId: msg.recipientIdentityId,
      message: decryptMessage(msg.message),
      context: msg.context,
      isRead: msg.isRead,
      createdAt: msg.createdAt
    }));

    // Mark messages as read
    await Message.updateMany(
      {
        recipientUserId: req.userId,
        senderIdentityId: friendIdentityId,
        context,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      count: decryptedMessages.length,
      messages: decryptedMessages
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all conversations for a context
router.get('/conversations/:context', authenticateToken, async (req, res) => {
  try {
    const { context } = req.params;

    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }

    // Get current user's identity in this context
    const userIdentity = await Identity.findOne({ userId: req.userId, context });
    if (!userIdentity) {
      return res.json({ conversations: [] });
    }

    // Get all friends in this context
    const friends = await Friend.find({
      userId: req.userId,
      context
    }).populate('friendIdentityId');

    // Filter out user's own identities
    const userIdentityIds = (await Identity.find({ userId: req.userId })).map(id => id._id.toString());
    const validFriends = friends.filter(f => !userIdentityIds.includes(f.friendIdentityId._id.toString()));

    // Get conversations with last message
    const conversations = await Promise.all(
      validFriends.map(async friend => {
        const lastMessage = await Message.findOne({
          $or: [
            {
              senderUserId: req.userId,
              recipientIdentityId: friend.friendIdentityId._id,
              context
            },
            {
              recipientUserId: req.userId,
              senderIdentityId: friend.friendIdentityId._id,
              context
            }
          ]
        })
          .sort({ createdAt: -1 })
          .select('message createdAt isRead');

        const unreadCount = await Message.countDocuments({
          recipientUserId: req.userId,
          senderIdentityId: friend.friendIdentityId._id,
          context,
          isRead: false
        });

        return {
          friendId: friend.friendIdentityId._id,
          friendName: friend.friendIdentityId.preferredName,
          friendLegalName: friend.friendIdentityId.legalName,
          lastMessage: lastMessage ? decryptMessage(lastMessage.message) : null,
          lastMessageTime: lastMessage?.createdAt || null,
          unreadCount,
          context
        };
      })
    );

    // Sort by last message time
    conversations.sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA;
    });

    res.json({
      count: conversations.length,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
