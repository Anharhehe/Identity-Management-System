const express = require('express');
const authenticateToken = require('../middleware/auth');
const { User, Identity, Notification } = require('../models');

const router = express.Router();

// Middleware to check admin status
const checkAdminStatus = async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};

// GET all users with their identities
router.get('/users', authenticateToken, checkAdminStatus, async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find({}, '-password').lean();

    // Fetch identities for each user
    const usersWithIdentities = await Promise.all(
      users.map(async (user) => {
        const identities = await Identity.find({ userId: user._id }).lean();
        return {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          identities: identities.map(identity => ({
            id: identity._id,
            type: identity.context,
            legalName: identity.legalName,
            preferredName: identity.preferredName,
            nickname: identity.nickname,
            createdAt: identity.createdAt,
          }))
        };
      })
    );

    res.status(200).json({
      message: 'Users fetched successfully',
      users: usersWithIdentities
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// POST send notification to a specific identity
router.post('/send-notification', authenticateToken, checkAdminStatus, async (req, res) => {
  try {
    const { identityId, identityType, title, message } = req.body;

    if (!identityId || !title || !message) {
      return res.status(400).json({ message: 'Identity ID, title, and message are required' });
    }

    // Find the identity
    const identity = await Identity.findById(identityId).populate('userId');
    if (!identity) {
      return res.status(404).json({ message: 'Identity not found' });
    }

    // Create and save notification
    const notification = new Notification({
      userId: identity.userId._id,
      identityId: identityId,
      title,
      message,
      identityType: identityType || identity.context,
      sentBy: req.user.email
    });

    await notification.save();

    // TODO: Implement real-time delivery via socket.io
    // io.to(`${identity.userId._id}:${identity.context}`).emit('notification', {
    //   id: notification._id,
    //   title: notification.title,
    //   message: notification.message,
    //   timestamp: notification.createdAt
    // });

    res.status(200).json({
      message: 'Notification sent successfully',
      notificationId: notification._id
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
});

// DELETE an identity
router.delete('/identities/:identityId', authenticateToken, checkAdminStatus, async (req, res) => {
  try {
    const { identityId } = req.params;

    // Find and delete the identity
    const identity = await Identity.findByIdAndDelete(identityId);
    if (!identity) {
      return res.status(404).json({ message: 'Identity not found' });
    }

    res.status(200).json({
      message: 'Identity deleted successfully',
      deletedIdentityId: identityId
    });
  } catch (error) {
    console.error('Error deleting identity:', error);
    res.status(500).json({ message: 'Error deleting identity', error: error.message });
  }
});

// POST make user an admin (only callable by existing admins)
router.post('/make-admin/:userId', authenticateToken, checkAdminStatus, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-promotion (optional security measure)
    if (userId === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot change your own admin status' });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: `${user.email} is now an admin`,
      userId: user._id,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Error making user admin:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// POST remove admin privileges from user (only callable by admins)
router.post('/remove-admin/:userId', authenticateToken, checkAdminStatus, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent self-demotion (optional security measure)
    if (userId === req.userId.toString()) {
      return res.status(400).json({ message: 'Cannot change your own admin status' });
    }

    // Find and update user
    const user = await User.findByIdAndUpdate(userId, { isAdmin: false }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: `Admin privileges removed from ${user.email}`,
      userId: user._id,
      isAdmin: user.isAdmin
    });
  } catch (error) {
    console.error('Error removing admin privileges:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

module.exports = router;
