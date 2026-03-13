const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  featuredImage: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General'
  },
  tags: [{
    type: String
  }],
  author: {
    type: String,
    default: 'VyomEdge'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number,
    default: 5
  }
}, { timestamps: true });

// Generate slug before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
  }
  // Auto-generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...';
  }
  // Calculate read time (avg 200 words per minute)
  if (this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200) || 1;
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
