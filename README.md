# VyomEdge Backend API

Backend API for VyomEdge website built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

3. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Blogs
- `GET /api/blogs` - Get all published blogs (public)
- `GET /api/blogs/slug/:slug` - Get blog by slug (public)
- `GET /api/blogs/admin/all` - Get all blogs (protected)
- `POST /api/blogs` - Create blog (protected)
- `PUT /api/blogs/:id` - Update blog (protected)
- `DELETE /api/blogs/:id` - Delete blog (protected)

### Portfolio
- `GET /api/portfolio` - Get all published items (public)
- `GET /api/portfolio/admin/all` - Get all items (protected)
- `POST /api/portfolio` - Create item (protected)
- `PUT /api/portfolio/:id` - Update item (protected)
- `DELETE /api/portfolio/:id` - Delete item (protected)

### Services
- `GET /api/services` - Get all published services (public)
- `GET /api/services/admin/all` - Get all services (protected)
- `POST /api/services` - Create service (protected)
- `PUT /api/services/:id` - Update service (protected)
- `DELETE /api/services/:id` - Delete service (protected)

### Inquiries (Contact Form)
- `POST /api/inquiries` - Submit inquiry (public)
- `GET /api/inquiries` - Get all inquiries (protected)
- `GET /api/inquiries/stats` - Get statistics (protected)
- `PUT /api/inquiries/:id` - Update inquiry (protected)
- `DELETE /api/inquiries/:id` - Delete inquiry (protected)

### Subscribers
- `POST /api/subscribers` - Subscribe (public)
- `DELETE /api/subscribers/unsubscribe` - Unsubscribe (public)
- `GET /api/subscribers` - Get all (protected)
- `DELETE /api/subscribers/:id` - Delete (protected)

## Deployment

Deploy to Render:
1. Create a new Web Service
2. Connect your GitHub repo
3. Set environment variables
4. Deploy!
