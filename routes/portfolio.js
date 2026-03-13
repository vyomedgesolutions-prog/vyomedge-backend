const express = require('express');
const Portfolio = require('../models/Portfolio');
const auth = require('../middleware/auth');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// @route   GET /api/portfolio
// @desc    Get all published portfolio items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const portfolio = await Portfolio.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 });

    res.json({ portfolio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/portfolio/:id
// @desc    Get single portfolio item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const item = await Portfolio.findOne({
      _id: req.params.id,
      isPublished: true
    });

    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json({ portfolio: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/portfolio/admin/all
// @desc    Get all portfolio items including unpublished
// @access  Private
router.get('/admin/all', auth, async (req, res) => {
  try {
    const portfolio = await Portfolio.find().sort({ order: 1, createdAt: -1 });
    res.json({ portfolio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/portfolio
// @desc    Create a new portfolio item
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const item = new Portfolio(req.body);
    await item.save();
    res.status(201).json({ message: 'Portfolio item created', portfolio: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/portfolio/:id
// @desc    Update a portfolio item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Portfolio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json({ message: 'Portfolio item updated', portfolio: item });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/portfolio/:id
// @desc    Delete a portfolio item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Portfolio.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Portfolio item not found' });
    }

    res.json({ message: 'Portfolio item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
