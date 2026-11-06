/**
 * esaService.js — Fetches ESA news from official RSS feeds.
 * RSS feeds: https://www.esa.int/Services/RSS_Feeds
 */
import Parser from 'rss-parser';

const parser = new Parser({
  timeout: 12000,
  headers: {
    'User-Agent': 'CosmosHub/1.0 (space news aggregator)',
    Accept: 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: false }],
      ['enclosure', 'enclosure'],
    ],
  },
});

const ESA_FEEDS = [
  { url: 'https://www.esa.int/rssfeed/Our_Activities/Space_Science', label: 'Space Science' },
  { url: 'https://www.esa.int/rssfeed/Our_Activities/Human_Spaceflight', label: 'Human Spaceflight' },
  { url: 'https://www.esa.int/rssfeed/Our_Activities/Exploring_space', label: 'Exploration' },
  { url: 'https://www.esa.int/rssfeed/Enabling_Support/Space_Engineering_Technology', label: 'Technology' },
];

/**
 * Fetch all ESA RSS feeds in parallel.
 * Uses Promise.allSettled so one failed feed doesn't break others.
 * Returns a flat, de-duplicated array of feed items.
 */
export async function fetchESANews() {
  const results = await Promise.allSettled(
    ESA_FEEDS.map(feed => parser.parseURL(feed.url))
  );

  const seen = new Set();
  const items = [];

  for (const result of results) {
    if (result.status !== 'fulfilled') {
      console.warn('[ESA] Feed fetch failed:', result.reason?.message);
      continue;
    }
    for (const item of result.value.items || []) {
      const key = item.link || item.guid;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }
  }

  return items;
}
