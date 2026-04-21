const express = require('express');
const { Identity, Friend, FriendRequest, Notification, User } = require('../models');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get friend requests for a specific context
router.get('/:context', authenticateToken, async (req, res) => {
  try {
    const { context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
    const recipientIdentity = await Identity.findOne({ userId: req.userId, context });
    if (!recipientIdentity) {
      return res.json({
        count: 0,
        requests: []
      });
    }
    
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
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { recipientIdentityId, context } = req.body;
    
    if (!recipientIdentityId || !context) {
      return res.status(400).json({ error: 'Recipient identity ID and context are required' });
    }
    
    const senderIdentity = await Identity.findOne({ userId: req.userId, context });
    if (!senderIdentity) {
      return res.status(400).json({ error: 'You do not have an identity in this context' });
    }
    
    const recipientIdentity = await Identity.findById(recipientIdentityId);
    if (!recipientIdentity) {
      return res.status(404).json({ error: 'Recipient identity not found' });
    }
    
    if (senderIdentity._id.toString() === recipientIdentity._id.toString()) {
      return res.status(400).json({ error: 'You cannot send a friend request to yourself' });
    }
    
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
    
    // Create notification for the recipient
    try {
      const sender = await User.findById(req.userId);
      await Notification.create({
        userId: recipientIdentity.userId,
        identityId: recipientIdentityId,
        title: 'Friend Request',
        message: `${senderIdentity.preferredName} requested to follow your ${context} account`,
        identityType: context,
        sentBy: sender?.email || 'system',
        isRead: false,
      });
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the request if notification creation fails
    }
    
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
router.post('/accept', authenticateToken, async (req, res) => {
  try {
    const { requestId, context } = req.body;
    
    if (!requestId || !context) {
      return res.status(400).json({ error: 'Request ID and context are required' });
    }
    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    if (friendRequest.recipientUserId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'You are not the recipient of this request' });
    }
    
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
router.post('/decline', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ error: 'Request ID is required' });
    }
    
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    if (friendRequest.recipientUserId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'You are not the recipient of this request' });
    }
    
    friendRequest.status = 'declined';
    await friendRequest.save();
    
    res.json({
      message: 'Friend request declined successfully',
      friendRequest: {
        id: friendRequest._id,
        status: friendRequest.status
      }
    });
    
  } catch (error) {
    console.error('Decline friend request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
