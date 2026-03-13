const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String }
}, { _id: false });

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  tagline: {
    type: String,
    required: [true, 'Tagline is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  icon: {
    type: String,
    default: '🚀'
  },
  category: {
    type: String,
    default: 'Marketing'
  },
  features: [{
    type: String
  }],
  deliverables: [deliverableSchema],
  highlight: {
    value: { type: String },
    label: { type: String },
    subLabel: { type: String }
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

// Generate slug before saving
serviceSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
