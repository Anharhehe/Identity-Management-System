const express = require('express');
const { Identity } = require('../models');
const { validateIdentity } = require('../utils/validators');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Create new identity profile
router.post('/', authenticateToken, validateIdentity, async (req, res) => {
  try {
    const { legalName, preferredName, nickname, context, accountPrivacy } = req.body;
    
    // Check if preferred name is already used by a different user
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
router.get('/', authenticateToken, async (req, res) => {
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
router.get('/context/:context', authenticateToken, async (req, res) => {
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
router.get('/public/:context', async (req, res) => {
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
router.get('/all/:context', async (req, res) => {
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

// Get identity profile by ID (public endpoint)
router.get('/profile/:id', async (req, res) => {
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
router.get('/:id', authenticateToken, async (req, res) => {
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
router.put('/:id', authenticateToken, validateIdentity, async (req, res) => {
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

// Delete identity
router.delete('/:id', authenticateToken, async (req, res) => {
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

module.exports = router;
