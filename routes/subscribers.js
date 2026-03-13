const express = require('express');
const Subscriber = require('../models/Subscriber');
const auth = require('../middleware/auth');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// @route   POST /api/subscribers
// @desc    Subscribe to newsletter
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return res.status(400).json({ error: 'Email is already subscribed' });
      } else {
        // Reactivate subscription
        existing.isActive = true;
        await existing.save();
        return res.json({ message: 'Welcome back! Your subscription has been reactivated.' });
      }
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({ 
      message: 'Thank you for subscribing!' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/subscribers/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
router.delete('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await Subscriber.findOne({ email });
    if (!subscriber) {
      return res.status(404).json({ error: 'Email not found' });
    }

    subscriber.isActive = false;
    await subscriber.save();

    res.json({ message: 'You have been unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/subscribers
// @desc    Get all subscribers
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { active, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const subscribers = await Subscriber.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Subscriber.countDocuments(query);
    const activeCount = await Subscriber.countDocuments({ isActive: true });

    res.json({
      subscribers,
      activeCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/subscribers/:id
// @desc    Delete a subscriber
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber not found' });
    }

    res.json({ message: 'Subscriber deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
