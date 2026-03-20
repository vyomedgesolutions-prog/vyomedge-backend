const mongoose = require("mongoose");
const slugify = require("slugify");

// ── FAQ sub-schema ─────────────────────────────────────────────────────────────
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "FAQ question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "FAQ answer is required"],
      trim: true,
    },
  },
  { _id: false }, // no separate _id per FAQ item
);

// ── Main blog schema ───────────────────────────────────────────────────────────
const blogSchema = new mongoose.Schema(
  {
    // ── Core Content ──────────────────────────────────────────
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"], // raw HTML from the rich-text editor
    },
    excerpt: {
      type: String,
      maxlength: 500,
      default: "",
    },

    // ── Media ─────────────────────────────────────────────────
    featuredImage: {
      type: String, // base64 data-URL  OR  https:// URL
      default: "",
    },

    // ── Taxonomy ──────────────────────────────────────────────
    category: {
      type: String,
      default: "General",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // ── Publishing ────────────────────────────────────────────
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    scheduledAt: {
      type: Date,
      default: null, // only set when status === 'scheduled'
    },

    // ── SEO Meta ──────────────────────────────────────────────
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 70,
      default: "",
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 170,
      default: "",
    },
    seoKeywords: {
      type: String, // comma-separated, e.g. "vitamin c, serum, skincare"
      trim: true,
      default: "",
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // ── FAQs ──────────────────────────────────────────────────
    // Stored as an array of { question, answer } objects.
    // Use these on the frontend to render an FAQ accordion and
    // inject JSON-LD FAQPage schema for Google rich results.
    faqs: {
      type: [faqSchema],
      default: [],
    },

    // ── Meta / Auto-computed ──────────────────────────────────
    author: {
      type: String,
      default: "VyomEdge",
    },
    views: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number, // minutes
      default: 1,
    },
  },
  { timestamps: true },
); // adds createdAt & updatedAt automatically

// ── Pre-save hooks ─────────────────────────────────────────────────────────────

blogSchema.pre("save", function (next) {
  // 1. Generate slug from title (only when title changes)
  if (this.isModified("title")) {
    this.slug =
      slugify(this.title, { lower: true, strict: true }) +
      "-" +
      Date.now().toString(36);
  }

  // 2. Sync isPublished flag with status field
  this.isPublished = this.status === "published";

  // 3. Fallback SEO title → post title
  if (!this.seoTitle) {
    this.seoTitle = this.title;
  }

  // 4. Auto-generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    this.excerpt =
      this.content.replace(/<[^>]*>/g, "").substring(0, 200) + "...";
  }

  // 5. Fallback seoDescription → excerpt
  if (!this.seoDescription && this.excerpt) {
    this.seoDescription = this.excerpt.substring(0, 160);
  }

  // 6. Auto-generate canonicalUrl from slug if not provided
  if (!this.canonicalUrl && this.slug) {
    this.canonicalUrl = `/blog/${this.slug}`;
  }

  // 7. Calculate read time (avg 200 words per minute)
  if (this.content) {
    const wordCount = this.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / 200) || 1;
  }

  next();
});

// ── Pre-update hook (findOneAndUpdate used by updateBlog API) ──────────────────

blogSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.status !== undefined) {
    update.isPublished = update.status === "published";
  }
  if (update.title && !update.slug) {
    update.slug =
      slugify(update.title, { lower: true, strict: true }) +
      "-" +
      Date.now().toString(36);
  }
  if (update.slug && !update.canonicalUrl) {
    update.canonicalUrl = `/blog/${update.slug}`;
  }
  if (update.title && !update.seoTitle) {
    update.seoTitle = update.title;
  }
  if (update.excerpt && !update.seoDescription) {
    update.seoDescription = update.excerpt.substring(0, 160);
  }

  next();
});

module.exports = mongoose.model("Blog", blogSchema);
