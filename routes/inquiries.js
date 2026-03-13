const express = require('express');
const Inquiry = require('../models/Inquiry');
const auth = require('../middleware/auth');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// @route   POST /api/inquiries
// @desc    Submit a contact form inquiry
// @access  Public
router.post('/', async (req, res) => {
  try {
    const inquiry = new Inquiry(req.body);
    await inquiry.save();
    
    res.status(201).json({ 
      message: 'Thank you! Your inquiry has been submitted successfully.',
      inquiry: {
        id: inquiry._id,
        name: inquiry.name,
        email: inquiry.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/inquiries
// @desc    Get all inquiries
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) {
      query.status = status;
    }

    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Inquiry.countDocuments(query);
    const unread = await Inquiry.countDocuments({ isRead: false });

    res.json({
      inquiries,
      unread,
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

// @route   GET /api/inquiries/stats
// @desc    Get inquiry statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const total = await Inquiry.countDocuments();
    const unread = await Inquiry.countDocuments({ isRead: false });
    const newInquiries = await Inquiry.countDocuments({ status: 'new' });
    const contacted = await Inquiry.countDocuments({ status: 'contacted' });
    const qualified = await Inquiry.countDocuments({ status: 'qualified' });
    const closed = await Inquiry.countDocuments({ status: 'closed' });

    // Get inquiries from last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = await Inquiry.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    res.json({
      total,
      unread,
      thisWeek,
      byStatus: {
        new: newInquiries,
        contacted,
        qualified,
        closed
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/inquiries/:id
// @desc    Get single inquiry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    // Mark as read
    if (!inquiry.isRead) {
      inquiry.isRead = true;
      await inquiry.save();
    }

    res.json({ inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/inquiries/:id
// @desc    Update inquiry (status, notes)
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry updated', inquiry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/inquiries/:id
// @desc    Delete an inquiry
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json({ message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
