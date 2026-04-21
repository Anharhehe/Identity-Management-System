const express = require('express');
const authenticateToken = require('../middleware/auth');
const { Notification } = require('../models');

const router = express.Router();

// GET all notifications for the current user (aggregated from all identities)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all notifications for this user with populated user and identity details
    const notifications = await Notification.find({ userId })
      .populate('userId', 'email firstName lastName')
      .populate('identityId', 'legalName preferredName nickname context')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Notifications fetched successfully',
      notifications: notifications.map(notif => ({
        id: notif._id,
        recipientUser: {
          id: notif.userId._id,
          email: notif.userId.email,
          firstName: notif.userId.firstName,
          lastName: notif.userId.lastName,
        },
        recipientIdentity: {
          id: notif.identityId._id,
          legalName: notif.identityId.legalName,
          preferredName: notif.identityId.preferredName,
          nickname: notif.identityId.nickname,
          context: notif.identityId.context,
        },
        title: notif.title,
        message: notif.message,
        identityType: notif.identityType,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
        sentBy: notif.sentBy,
      }))
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// PATCH mark notification as read
router.patch('/:notificationId/mark-read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Find and update the notification
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification marked as read',
      notification: {
        id: notification._id,
        isRead: notification.isRead,
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
});

// DELETE notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Find and delete the notification
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

module.exports = router;
