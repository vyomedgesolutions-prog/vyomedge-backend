const express = require('express');
const Blog      = require('../models/Blog');
const Portfolio = require('../models/Portfolio');
const router    = express.Router();

const SITE_URL = 'https://www.vyomedge.com';

const staticPages = [
  { url: '/',          label: 'Home' },
  { url: '/about',     label: 'About VyomEdge' },
  { url: '/services',  label: 'Digital Marketing & IT Services' },
  { url: '/portfolio', label: 'Portfolio & Case Studies' },
  { url: '/resources', label: 'Resources & Blog' },
  { url: '/tools',     label: 'Free Digital Tools' },
  { url: '/contact',   label: 'Contact VyomEdge' },
  { url: '/legal/privacy-policy',  label: 'Privacy Policy' },
  { url: '/legal/terms',           label: 'Terms & Conditions' },
  { url: '/legal/disclaimer',      label: 'Disclaimer' },
  { url: '/legal/cookies',         label: 'Cookie Policy' },
]

// @route  GET /crawl
// @desc   Plain HTML page with all links for SEO crawlers
// @access Public
router.get('/', async (req, res) => {
  try {
    // Fetch all published blogs
    const blogs = await Blog.find({ isPublished: true })
      .select('slug title category createdAt')
      .sort({ createdAt: -1 })

    // Fetch all published portfolio items
    const portfolio = await Portfolio.find({ isPublished: true })
      .select('client tags')

    // Build HTML
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>VyomEdge — Site Index for Crawlers</title>
  <meta name="robots" content="index, follow">
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1 { color: #7600C4; }
    h2 { color: #333; border-bottom: 2px solid #7600C4; padding-bottom: 8px; margin-top: 40px; }
    ul { list-style: none; padding: 0; }
    li { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    a { color: #7600C4; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .meta { color: #999; font-size: 13px; margin-left: 8px; }
    .count { background: #7600C420; color: #7600C4; padding: 2px 8px; border-radius: 12px; font-size: 13px; }
  </style>
</head>
<body>
  <h1>VyomEdge — Complete Site Index</h1>
  <p>Full-stack digital marketing and IT services agency based in Bhopal, India.</p>
  <p>
    <strong>Website:</strong> <a href="${SITE_URL}">${SITE_URL}</a> &nbsp;|&nbsp;
    <strong>Email:</strong> info@vyomedge.com &nbsp;|&nbsp;
    <strong>Phone:</strong> +91 7974186754
  </p>

  <h2>Main Pages <span class="count">${staticPages.length}</span></h2>
  <ul>
    ${staticPages.map(p => `
    <li>
      <a href="${SITE_URL}${p.url}">${SITE_URL}${p.url}</a>
      <span class="meta">— ${p.label}</span>
    </li>`).join('')}
  </ul>

  <h2>Blog Posts <span class="count">${blogs.length}</span></h2>
  <ul>
    ${blogs.map(b => `
    <li>
      <a href="${SITE_URL}/blog/${b.slug}">${SITE_URL}/blog/${b.slug}</a>
      <span class="meta">— ${b.title}${b.category ? ` | ${b.category}` : ''}</span>
    </li>`).join('')}
  </ul>

  <h2>Portfolio Clients <span class="count">${portfolio.length}</span></h2>
  <ul>
    ${portfolio.map(p => `
    <li>
      <span>${p.client}</span>
      <span class="meta">— ${p.tags?.join(', ') || 'Digital Marketing'}</span>
    </li>`).join('')}
  </ul>

  <h2>Services</h2>
  <ul>
    <li><a href="${SITE_URL}/services#seo">SEO — Search Engine Optimisation</a></li>
    <li><a href="${SITE_URL}/services#meta-ads">Meta Ads — Facebook & Instagram Advertising</a></li>
    <li><a href="${SITE_URL}/services#google-ads">Google Ads — Search & Display Campaigns</a></li>
    <li><a href="${SITE_URL}/services#smm">Social Media Management</a></li>
    <li><a href="${SITE_URL}/services#web-dev">Web Development — MERN Stack</a></li>
    <li><a href="${SITE_URL}/services#app-dev">App Development</a></li>
    <li><a href="${SITE_URL}/services#ui-ux">UI/UX Design</a></li>
    <li><a href="${SITE_URL}/services#graphic-design">Graphic Design</a></li>
    <li><a href="${SITE_URL}/services#it-support">IT Support</a></li>
  </ul>

  <footer style="margin-top:60px;padding-top:20px;border-top:1px solid #eee;color:#999;font-size:13px;">
    <p>VyomEdge | FF-12, SRP Arcade, E-5 Arera Colony, Bhopal, MP 462016, India</p>
    <p>Generated dynamically — last updated: ${new Date().toISOString().split('T')[0]}</p>
    <p><a href="${SITE_URL}/sitemap.xml">sitemap.xml</a> | <a href="${SITE_URL}/llms.txt">llms.txt</a> | <a href="${SITE_URL}/robots.txt">robots.txt</a></p>
  </footer>
</body>
</html>`

    res.setHeader('Content-Type', 'text/html')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(html)

  } catch (error) {
    console.error('Crawl page error:', error)
    res.status(500).json({ error: 'Failed to generate crawl page' })
  }
})

module.exports = router
