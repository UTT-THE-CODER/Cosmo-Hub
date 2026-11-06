/**
 * newsController.js — Business logic layer.
 * Coordinates fetching from external APIs, normalizing data, storing to DB,
 * and querying cached data for API responses.
 */
import {
  fetchAPOD,
  fetchNEOs,
  fetchDONKISolarFlares,
  fetchDONKICMEs,
  fetchNASAImageForNEO,
} from './services/nasaService.js';
import {
  fetchLatestLaunch,
  fetchUpcomingLaunches,
  fetchRecentLaunches,
  fetchRockets,
} from './services/spacexService.js';
import { fetchISROPressReleases } from './services/isroService.js';
import { fetchESANews } from './services/esaService.js';
import { fetchArxivAstronomy } from './services/astronomyService.js';
import { fetchExoplanets } from './services/exoplanetService.js';

import {
  normalizeAPOD,
  normalizeDONKI,
  normalizeNEO,
  normalizeSpaceXLaunch,
  normalizeISROPressRelease,
  normalizeESA,
  normalizeArxiv,
  normalizeExoplanet,
} from './newsNormalizer.js';

import {
  upsertArticles,
  upsertAPOD,
  upsertLaunch,
  upsertExoplanet,
  queryNews,
  getNewsArticle,
  updateNewsImageLookup,
  getRelatedNEOArticles,
  getLatestAPOD,
  getLaunches,
  getExoplanets,
} from './newsStore.js';

/**
 * Fetch and store all NASA news (APOD, DONKI, NEOs).
 */
export async function fetchAndStoreNASA() {
  const results = await Promise.allSettled([
    fetchAPOD(),
    fetchDONKISolarFlares(),
    fetchDONKICMEs(),
    fetchNEOs(),
  ]);

  const articles = [];

  // APOD
  if (results[0].status === 'fulfilled' && results[0].value) {
    const apod = results[0].value;
    await upsertAPOD(apod).catch(e => console.warn('[NASA] APOD store failed:', e.message));
    articles.push(normalizeAPOD(apod));
  } else {
    console.warn('[NASA] APOD fetch failed:', results[0].reason?.message);
  }

  // Solar Flares
  if (results[1].status === 'fulfilled') {
    for (const event of results[1].value.slice(0, 5)) {
      articles.push(normalizeDONKI(event, 'Solar Flare'));
    }
  } else {
    console.warn('[NASA] DONKI FLR failed:', results[1].reason?.message);
  }

  // CMEs
  if (results[2].status === 'fulfilled') {
    for (const event of results[2].value.slice(0, 5)) {
      articles.push(normalizeDONKI(event, 'Coronal Mass Ejection'));
    }
  } else {
    console.warn('[NASA] DONKI CME failed:', results[2].reason?.message);
  }

  // NEOs
  if (results[3].status === 'fulfilled') {
    for (const neo of results[3].value.slice(0, 10)) {
      articles.push(normalizeNEO(neo));
    }
  } else {
    console.warn('[NASA] NEO fetch failed:', results[3].reason?.message);
  }

  const stored = await upsertArticles(articles);
  console.log(`[NASA] Stored: ${stored.inserted} articles, rejected: ${stored.rejected}, failed: ${stored.failed}`);
  return stored;
}

/**
 * Fetch and store SpaceX launches.
 */
export async function fetchAndStoreSpaceX() {
  const results = await Promise.allSettled([
    fetchRockets(),
    fetchRecentLaunches(20),
    fetchUpcomingLaunches(),
  ]);

  const rockets = results[0].status === 'fulfilled' ? results[0].value : [];
  const recentLaunches = results[1].status === 'fulfilled' ? results[1].value : [];
  const upcomingLaunches = results[2].status === 'fulfilled' ? results[2].value : [];

  if (results[0].status === 'rejected') console.warn('[SpaceX] Rockets failed:', results[0].reason?.message);
  if (results[1].status === 'rejected') console.warn('[SpaceX] Recent launches failed:', results[1].reason?.message);
  if (results[2].status === 'rejected') console.warn('[SpaceX] Upcoming launches failed:', results[2].reason?.message);

  // Store raw launches to launches table
  const allLaunches = [...recentLaunches, ...upcomingLaunches];
  for (const launch of allLaunches) {
    const rocketObj = rockets.find(r => r.id === launch.rocket) || null;
    const augmented = { ...launch, rocket_name: rocketObj?.name || null };
    await upsertLaunch(augmented).catch(e => console.warn('[SpaceX] Launch store failed:', e.message));
  }

  // Normalize into news articles
  const articles = allLaunches.map(l => normalizeSpaceXLaunch(l, rockets));
  const stored = await upsertArticles(articles);
  console.log(`[SpaceX] Stored: ${stored.inserted} articles, rejected: ${stored.rejected}, failed: ${stored.failed}`);
  return stored;
}

/**
 * Fetch and store ISRO data.
 */
export async function fetchAndStoreISRO() {
  const releases = await fetchISROPressReleases();
  const articles = releases.map(normalizeISROPressRelease);
  const stored = await upsertArticles(articles);
  console.log(
    `[ISRO] Stored: ${stored.inserted} articles, rejected: ${stored.rejected}, failed: ${stored.failed}. ` +
    'Using official ISRO Press archive releases.'
  );
  return stored;
}

/**
 * Fetch and store ESA news from RSS.
 */
export async function fetchAndStoreESA() {
  const items = await fetchESANews();
  const articles = items.slice(0, 30).map(normalizeESA);
  const stored = await upsertArticles(articles);
  console.log(`[ESA] Stored: ${stored.inserted} articles, rejected: ${stored.rejected}, failed: ${stored.failed}`);
  return stored;
}

/**
 * Fetch and store arXiv astronomy papers.
 */
export async function fetchAndStoreAstronomy() {
  const items = await fetchArxivAstronomy();
  const articles = items.slice(0, 40).map(normalizeArxiv);
  const stored = await upsertArticles(articles);
  console.log(`[Astronomy] Stored: ${stored.inserted} articles, rejected: ${stored.rejected}, failed: ${stored.failed}`);
  return stored;
}

/**
 * Fetch and store exoplanet data.
 */
export async function fetchAndStoreExoplanets() {
  const planets = await fetchExoplanets(200);

  for (const planet of planets) {
    await upsertExoplanet(planet).catch(e =>
      console.warn(`[Exoplanets] Store failed for ${planet.pl_name}:`, e.message)
    );
  }

  const articles = planets.slice(0, 30).map(normalizeExoplanet);
  const stored = await upsertArticles(articles);
  console.log(`[Exoplanets] Stored: ${stored.inserted} archive records, rejected: ${stored.rejected}, failed: ${stored.failed}`);
  return stored;
}

/**
 * Fetch and store ALL sources. Uses Promise.allSettled to isolate failures.
 */
export async function fetchAndStoreAll() {
  console.log('[Scheduler] Starting full news fetch...');
  const results = await Promise.allSettled([
    fetchAndStoreNASA(),
    fetchAndStoreSpaceX(),
    fetchAndStoreISRO(),
    fetchAndStoreESA(),
    fetchAndStoreAstronomy(),
    fetchAndStoreExoplanets(),
  ]);

  const labels = ['NASA', 'SpaceX', 'ISRO', 'ESA', 'Astronomy', 'Exoplanets'];
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[Scheduler] ${labels[i]} source FAILED:`, r.reason?.message);
    } else {
      console.log(`[Scheduler] ${labels[i]} complete.`);
    }
  });
  console.log('[Scheduler] Full fetch complete.');
}

// ───────────────────────────────────────────────
// Express route handler functions
// ───────────────────────────────────────────────

export async function handleGetNews(req, res) {
  try {
    const { category, source, search, page = 1, limit = 20, sort, order } = req.query;
    const data = await queryNews({
      category,
      source,
      search,
      page: parseInt(page),
      limit: Math.min(parseInt(limit) || 20, 100),
      sort,
      order,
    });
    res.json({ success: true, ...data });
  } catch (err) {
    console.error('[News] Query failed:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve news.' });
  }
}

export async function handleGetNewsArticle(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ success: false, error: 'Invalid article ID.' });
  }

  try {
    const article = await getNewsArticle(id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found.' });
    }

    if (
      article.metadata?.type === 'near_earth_object'
      && !article.image_url
      && !article.metadata.imageLookupAt
    ) {
      try {
        const image = await fetchNASAImageForNEO(article.metadata);
        await updateNewsImageLookup(id, image);
        if (image) {
          article.image_url = image.imageUrl;
          article.metadata.imageAttribution = image.attribution;
        }
        article.metadata.imageLookupAt = new Date().toISOString();
      } catch (imageError) {
        console.warn('[NASA] NEO image lookup failed:', imageError.message);
      }
    }

    let related = [];
    if (article.metadata?.type === 'near_earth_object') {
      try {
        related = await getRelatedNEOArticles(id);
      } catch (relatedError) {
        console.warn('[News] Related NEO query failed:', relatedError.message);
      }
    }
    return res.json({ success: true, article, related });
  } catch (err) {
    console.error('[News] Article query failed:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve article.' });
  }
}

export async function handleGetAPOD(req, res) {
  try {
    const apod = await getLatestAPOD();
    if (!apod) {
      // Attempt live fetch if DB is empty
      try {
        const live = await fetchAPOD();
        await upsertAPOD(live);
        return res.json({ success: true, apod: live });
      } catch {
        return res.status(503).json({ success: false, error: 'APOD not available.' });
      }
    }
    res.json({ success: true, apod });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve APOD.' });
  }
}

export async function handleGetLaunches(req, res) {
  try {
    const upcoming = req.query.upcoming === 'true';
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const launches = await getLaunches({ upcoming, limit });
    res.json({ success: true, launches });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve launches.' });
  }
}

export async function handleGetExoplanets(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const data = await getExoplanets({ limit, page });
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve exoplanets.' });
  }
}

export async function handleRefreshSource(req, res) {
  const { source } = req.params;
  const sourceMap = {
    nasa: fetchAndStoreNASA,
    spacex: fetchAndStoreSpaceX,
    isro: fetchAndStoreISRO,
    esa: fetchAndStoreESA,
    astronomy: fetchAndStoreAstronomy,
    exoplanets: fetchAndStoreExoplanets,
    all: fetchAndStoreAll,
  };

  const fn = sourceMap[source?.toLowerCase()];
  if (!fn) return res.status(400).json({ success: false, error: 'Unknown source.' });

  try {
    await fn();
    res.json({ success: true, message: `${source} refreshed.` });
  } catch (err) {
    res.status(500).json({ success: false, error: `Refresh failed: ${err.message}` });
  }
}
