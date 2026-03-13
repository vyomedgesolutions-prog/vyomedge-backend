const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  client: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  url: {
    type: String,
    default: '#'
  },
  tags: [{
    type: String
  }],
  icon: {
    type: String,
    default: '📁'
  },
  color: {
    type: String,
    default: '#7600C4'
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  results: [resultSchema],
  metrics: {
    da: { type: Number, default: 0 },
    pa: { type: Number, default: 0 }
  },
  featuredImage: {
    type: String,
    default: ''
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
