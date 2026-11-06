/**
 * server.js — Main Express server entry point for Cosmo Hub backend.
 * Starts the HTTP server, initializes the database, mounts routes,
 * and starts the news scheduler.
 */
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

import { initDB } from './db.js';
import newsRoutes from './newsRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import { startScheduler, initialFetch } from './newsScheduler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

app.use(express.json({ limit: '1mb' }));

// Rate limiting — protect external-facing API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});

app.use('/api', apiLimiter);

// ── Routes ────────────────────────────────────

// Mount all news and space endpoints under /api
// News: GET /api/news, /api/news/nasa, /api/news/spacex, ...
// Space: GET /api/news/apod, /api/news/launches, /api/news/exoplanets-data
// Refresh: POST /api/news/refresh/:source
app.use('/api/news', newsRoutes);
app.use('/api/quotes', quoteRoutes);

// Space shorthand aliases
app.get('/api/space/apod', (req, res) => res.redirect('/api/news/apod'));
app.get('/api/space/launches', (req, res) => res.redirect('/api/news/launches'));
app.get('/api/space/exoplanets', (req, res) => res.redirect('/api/news/exoplanets-data'));

// ── Health check ──────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    service: 'Cosmo Hub API',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// ── 404 handler ───────────────────────────────

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found.' });
});

// ── Error handler ─────────────────────────────

app.use((err, req, res, _next) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ── Startup ───────────────────────────────────

async function start() {
  try {
    console.log('[Server] Initializing database...');
    await initDB();
    console.log('[Server] Database ready.');

    app.listen(PORT, () => {
      console.log(`[Server] 🚀 Cosmo Hub API running at http://localhost:${PORT}`);
      console.log(`[Server] Client origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    });

    // Start scheduler (non-blocking)
    startScheduler();

    // Trigger initial data fetch after a short delay to let server settle
    setTimeout(() => {
      initialFetch().catch(err =>
        console.error('[Server] Initial fetch failed silently:', err.message)
      );
    }, 3000);
  } catch (err) {
    console.error('[Server] Startup failed:', err.message);
    process.exit(1);
  }
}

start();
