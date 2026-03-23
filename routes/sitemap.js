const express = require('express');
const Blog = require('../models/Blog');
const router = express.Router();

const SITE_URL = 'https://www.vyomedge.com';

const staticPages = [
  { url: '/',          changefreq: 'weekly',  priority: '1.0' },
  { url: '/about',     changefreq: 'monthly', priority: '0.8' },
  { url: '/services',  changefreq: 'monthly', priority: '0.9' },
  { url: '/portfolio', changefreq: 'weekly',  priority: '0.9' },
  { url: '/resources', changefreq: 'weekly',  priority: '0.8' },
  { url: '/tools',     changefreq: 'monthly', priority: '0.7' },
  { url: '/contact',   changefreq: 'monthly', priority: '0.8' },
  { url: '/legal/privacy-policy', changefreq: 'yearly', priority: '0.4' },
  { url: '/legal/terms',          changefreq: 'yearly', priority: '0.4' },
  { url: '/legal/disclaimer',     changefreq: 'yearly', priority: '0.4' },
  { url: '/legal/cookies',        changefreq: 'yearly', priority: '0.3' },
];

// @route  GET /sitemap.xml
// @desc   Dynamic XML sitemap
// @access Public
router.get('/', async (req, res) => {
  try {
    // Fetch all published blogs
    const blogs = await Blog.find({ isPublished: true })
      .select('slug updatedAt createdAt')
      .sort({ createdAt: -1 });

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;

    // Static pages
    xml += `  <!-- Static Pages -->\n`;
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${SITE_URL}${page.url}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Dynamic blog pages
    if (blogs.length > 0) {
      xml += `\n  <!-- Blog Posts -->\n`;
      blogs.forEach(blog => {
        const lastmod = (blog.updatedAt || blog.createdAt)
          .toISOString().split('T')[0];
        xml += `  <url>\n`;
        xml += `    <loc>${SITE_URL}/blog/${blog.slug}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>yearly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });
    }

    xml += `\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // cache 1 hour
    res.status(200).send(xml);

  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
});

module.exports = router;
