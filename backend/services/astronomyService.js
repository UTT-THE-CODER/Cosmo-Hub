/**
 * astronomyService.js — Fetches recent astronomy papers from arXiv RSS feeds.
 * Feeds: https://rss.arxiv.org/rss/astro-ph
 * Subcategories: astro-ph.GA, astro-ph.EP, astro-ph.SR, astro-ph.CO
 */
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 12000,
  headers: {
    'User-Agent': 'CosmosHub/1.0 (space news aggregator)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
});

const ARXIV_FEEDS = [
  'https://rss.arxiv.org/rss/astro-ph.GA',  // Galactic Astrophysics
  'https://rss.arxiv.org/rss/astro-ph.EP',  // Earth and Planetary Astrophysics
  'https://rss.arxiv.org/rss/astro-ph.SR',  // Solar and Stellar Astrophysics
  'https://rss.arxiv.org/rss/astro-ph.CO',  // Cosmology and Nongalactic Astrophysics
];

/**
 * Fetch all arXiv astro-ph subcategory feeds in parallel.
 * Returns a flat, deduplicated array of RSS items (max ~80 items total).
 */
export async function fetchArxivAstronomy() {
  const results = await Promise.allSettled(
    ARXIV_FEEDS.map(url => parser.parseURL(url))
  );

  const seen = new Set();
  const items = [];

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('[arXiv] Feed failed:', result.reason?.message);
      continue;
    }
    for (const item of result.value.items || []) {
      const key = item.link || item.guid;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }
  }

  // Sort by date descending (newest first)
  items.sort((a, b) => {
    const da = new Date(a.pubDate || a.isoDate || 0);
    const db = new Date(b.pubDate || b.isoDate || 0);
    return db - da;
  });

  return items;
}
