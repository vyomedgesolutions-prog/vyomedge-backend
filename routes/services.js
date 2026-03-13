const express = require('express');
const Service = require('../models/Service');
const auth = require('../middleware/auth');

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// @route   GET /api/services
// @desc    Get all published services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isPublished: true })
      .sort({ order: 1, createdAt: -1 });

    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/services/slug/:slug
// @desc    Get service by slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const service = await Service.findOne({
      slug: req.params.slug,
      isPublished: true
    });

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/services/admin/all
// @desc    Get all services including unpublished
// @access  Private
router.get('/admin/all', auth, async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/services
// @desc    Create a new service
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json({ message: 'Service created', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/services/:id
// @desc    Update a service
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service updated', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/services/:id
// @desc    Delete a service
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
