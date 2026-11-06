/**
 * newsRoutes.js — Express router defining all news API endpoints.
 */
import { Router } from 'express';
import {
  handleGetNews,
  handleGetNewsArticle,
  handleGetAPOD,
  handleGetLaunches,
  handleGetExoplanets,
  handleRefreshSource,
} from './newsController.js';

const router = Router();

// ── News endpoints ────────────────────────────
// GET /api/news                   — All news (paginated, filterable)
// GET /api/news/nasa              — NASA articles only
// GET /api/news/spacex            — SpaceX articles only
// GET /api/news/isro              — ISRO articles only
// GET /api/news/esa               — ESA articles only
// GET /api/news/astronomy         — Astronomy (arXiv) articles only
// GET /api/news/exoplanets        — Exoplanet discovery articles only

router.get('/', handleGetNews);

router.get('/nasa', (req, res) => {
  req.query.category = 'NASA';
  return handleGetNews(req, res);
});

router.get('/spacex', (req, res) => {
  req.query.category = 'SpaceX';
  return handleGetNews(req, res);
});

router.get('/isro', (req, res) => {
  req.query.category = 'ISRO';
  return handleGetNews(req, res);
});

router.get('/esa', (req, res) => {
  req.query.category = 'ESA';
  return handleGetNews(req, res);
});

router.get('/astronomy', (req, res) => {
  req.query.category = 'Astronomy';
  return handleGetNews(req, res);
});

router.get('/exoplanets', (req, res) => {
  req.query.category = 'Exoplanets';
  return handleGetNews(req, res);
});

// ── Space-specific endpoints ──────────────────
// GET /api/space/apod             — NASA APOD
// GET /api/space/launches         — SpaceX launches
// GET /api/space/exoplanets       — Exoplanet archive data

router.get('/apod', handleGetAPOD);
router.get('/launches', handleGetLaunches);
router.get('/exoplanets-data', handleGetExoplanets);

router.get('/:id', handleGetNewsArticle);

// ── Manual refresh (admin/dev only) ──────────
// POST /api/news/refresh/:source
router.post('/refresh/:source', handleRefreshSource);

export default router;
