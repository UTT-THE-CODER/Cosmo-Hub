/**
 * isroService.js — Reads official ISRO press releases and catalogue data.
 * News source: https://www.isro.gov.in/Press.html
 * Catalogue API: https://isro.vercel.app
 */
import axios from 'axios';
import { safeDate, sanitizeText } from '../utils/helpers.js';

const BASE = 'https://isro.vercel.app';
const TIMEOUT = 12000;
const PRESS_ARCHIVE_URL = 'https://www.isro.gov.in/Press.html';
const PRESS_ARCHIVE_HOST = 'www.isro.gov.in';

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(parseInt(code, 16)));
}

function readAttributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
      .map((match) => [match[1].toLowerCase(), decodeHtml(match[2] ?? match[3] ?? match[4])])
  );
}

function textFromHtml(value) {
  return sanitizeText(decodeHtml(String(value || '').replace(/<[^>]*>/g, ' ')));
}

function dateAtUtcMidnight(value) {
  const date = safeDate(value);
  return date
    ? new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    : null;
}

function getMetaContent(html, keys) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = readAttributes(match[0]);
    const key = (attributes.name || attributes.property || '').toLowerCase();
    if (keys.includes(key) && attributes.content) return textFromHtml(attributes.content);
  }
  return '';
}

function parsePressReleaseRows(html) {
  const releases = [];
  const seen = new Set();
  for (const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const row = match[1];
    const anchorMatch = row.match(/<a\b[^>]*>/i);
    if (!anchorMatch) continue;

    const attributes = readAttributes(anchorMatch[0]);
    const href = attributes.href;
    if (!href || !/\.html(?:[?#]|$)/i.test(href)) continue;

    const anchorText = row.match(/<a\b[^>]*>([\s\S]*?)<\/a>/i)?.[1] || '';
    const title = textFromHtml(attributes.title || anchorText);
    if (title.length < 5) continue;

    let url;
    try {
      url = new URL(href, PRESS_ARCHIVE_URL);
    } catch {
      continue;
    }
    if (url.hostname !== PRESS_ARCHIVE_HOST || seen.has(url.href)) continue;
    seen.add(url.href);

    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
    const publishedAt = cells.length > 1
      ? dateAtUtcMidnight(textFromHtml(cells[cells.length - 1][1]))
      : null;
    releases.push({ title, url: url.href, publishedAt });
  }
  return releases;
}

async function fetchReleaseMetadata(release) {
  try {
    const response = await axios.get(release.url, {
      timeout: TIMEOUT,
      headers: { 'User-Agent': 'CosmosHub/1.0 (ISRO public press release reader)' },
    });
    const html = String(response.data || '');
    const description = getMetaContent(html, ['description', 'og:description']);
    const imagePath = getMetaContent(html, ['og:image', 'twitter:image']);
    let imageUrl = null;
    if (imagePath) {
      try {
        const url = new URL(imagePath, release.url);
        if (url.protocol === 'https:' && url.hostname === PRESS_ARCHIVE_HOST) imageUrl = url.href;
      } catch {
        imageUrl = null;
      }
    }
    return { ...release, description, imageUrl };
  } catch (error) {
    console.warn(`[ISRO] Press release metadata unavailable for ${release.url}:`, error.message);
    return { ...release, description: '', imageUrl: null };
  }
}

/**
 * Read the official ISRO press archive. The community API only contains
 * spacecraft/launcher catalogue records, so it is not suitable as a news feed.
 */
export async function fetchISROPressReleases(limit = 30) {
  const response = await axios.get(PRESS_ARCHIVE_URL, {
    timeout: TIMEOUT,
    headers: { 'User-Agent': 'CosmosHub/1.0 (ISRO public press release reader)' },
  });
  const releases = parsePressReleaseRows(String(response.data || '')).slice(0, limit);
  if (!releases.length) {
    throw new Error('The official ISRO Press archive contained no recognizable release entries.');
  }

  const results = [];
  for (let index = 0; index < releases.length; index += 5) {
    const batch = releases.slice(index, index + 5);
    results.push(...await Promise.all(batch.map(fetchReleaseMetadata)));
  }
  return results;
}

/**
 * Fetch ISRO spacecrafts list.
 */
export async function fetchISROSpacecrafts() {
  const res = await axios.get(`${BASE}/api/spacecrafts`, { timeout: TIMEOUT });
  // The API returns { spacecrafts: [...] } or { data: [...] }
  const data = res.data;
  return data?.spacecrafts || data?.data || (Array.isArray(data) ? data : []);
}

/**
 * Fetch ISRO launchers list.
 */
export async function fetchISROLaunchers() {
  const res = await axios.get(`${BASE}/api/launchers`, { timeout: TIMEOUT });
  const data = res.data;
  return data?.launchers || data?.data || (Array.isArray(data) ? data : []);
}

/**
 * Fetch ISRO customer satellites.
 */
export async function fetchISROCustomerSatellites() {
  const res = await axios.get(`${BASE}/api/customer_satellites`, { timeout: TIMEOUT });
  const data = res.data;
  return data?.customer_satellites || data?.data || (Array.isArray(data) ? data : []);
}

/**
 * Fetch ISRO centres.
 */
export async function fetchISROCentres() {
  const res = await axios.get(`${BASE}/api/centres`, { timeout: TIMEOUT });
  const data = res.data;
  return data?.centres || data?.data || (Array.isArray(data) ? data : []);
}
