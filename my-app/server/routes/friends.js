const express = require('express');
const { Identity, Friend, FriendRequest, Notification, User } = require('../models');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get all friends for a specific context
router.get('/:context', authenticateToken, async (req, res) => {
  try {
    const { context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }

    // Get all identities of the current user
    const userIdentities = await Identity.find({ userId: req.userId });
    const userIdentityIds = userIdentities.map(id => id._id.toString());
    
    const friends = await Friend.find({
      userId: req.userId,
      context
    }).populate('friendIdentityId').sort({ createdAt: -1 });
    
    const friendIdentities = friends
      .filter(friend => {
        if (!friend.friendIdentityId) {
          return false;
        }
        const isSelf = userIdentityIds.includes(friend.friendIdentityId._id.toString());
        return !isSelf;
      })
      .map(friend => ({
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
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { friendIdentityId, context } = req.body;
    
    if (!friendIdentityId || !context) {
      return res.status(400).json({ error: 'Friend identity ID and context are required' });
    }
    
    // Get sender identity info
    const senderIdentity = await Identity.findOne({ userId: req.userId, context });
    if (!senderIdentity) {
      return res.status(400).json({ error: 'You do not have an identity in this context' });
    }
    
    // Get recipient identity info
    const recipientIdentity = await Identity.findById(friendIdentityId);
    if (!recipientIdentity) {
      return res.status(404).json({ error: 'Identity not found' });
    }
    
    // Add friend relationship
    const friend = await Friend.findOneAndUpdate(
      { userId: req.userId, friendIdentityId, context },
      { userId: req.userId, friendIdentityId, context },
      { upsert: true, new: true }
    );
    
    // Create notification for the followed user if account is public
    if (recipientIdentity.accountPrivacy === 'public') {
      try {
        const sender = await User.findById(req.userId);
        await Notification.create({
          userId: recipientIdentity.userId,
          identityId: friendIdentityId,
          title: 'New Follower',
          message: `${senderIdentity.preferredName} started following your ${context} account`,
          identityType: context,
          sentBy: sender?.email || 'system',
          isRead: false,
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Don't fail the request if notification creation fails
      }
    }
    
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
router.post('/remove', authenticateToken, async (req, res) => {
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

// Check if users are friends
router.get('/check/:friendIdentityId/:context', authenticateToken, async (req, res) => {
  try {
    const { friendIdentityId, context } = req.params;
    
    if (!['professional', 'personal', 'family', 'online'].includes(context)) {
      return res.status(400).json({ error: 'Invalid context type' });
    }
    
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

module.exports = router;
