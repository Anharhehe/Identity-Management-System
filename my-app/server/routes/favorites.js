const express = require('express');
const { Favorite, Identity } = require('../models');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get favorites by context
router.get('/:context', authenticateToken, async (req, res) => {
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
router.post('/:identityId', authenticateToken, async (req, res) => {
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
router.delete('/:identityId', authenticateToken, async (req, res) => {
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

module.exports = router;
