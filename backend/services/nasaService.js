/**
 * nasaService.js — Fetches data from NASA public APIs.
 * Uses:
 *   - APOD (Astronomy Picture of the Day)
 *   - NeoWs (Near Earth Objects)
 *   - DONKI (Space Weather Events)
 * API key is read from environment variables — NEVER exposed to the client.
 */
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const NASA_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const BASE = 'https://api.nasa.gov';
const TIMEOUT = 12000; // 12s timeout per request
const IMAGE_SEARCH_BASE = 'https://images-api.nasa.gov/search';
const imageSearchCache = new Map();
const IMAGE_CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Fetch NASA Astronomy Picture of the Day.
 * @param {string} date - YYYY-MM-DD (defaults to today)
 */
export async function fetchAPOD(date = null) {
  const params = { api_key: NASA_KEY };
  if (date) params.date = date;

  const res = await axios.get(`${BASE}/planetary/apod`, { params, timeout: TIMEOUT });
  return res.data;
}

/**
 * Fetch recent Near Earth Objects from NeoWs.
 * Returns objects for the next 7 days.
 */
export async function fetchNEOs() {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);

  const fmt = (d) => d.toISOString().split('T')[0];

  const res = await axios.get(`${BASE}/neo/rest/v1/feed`, {
    params: {
      start_date: fmt(today),
      end_date: fmt(endDate),
      api_key: NASA_KEY,
    },
    timeout: TIMEOUT,
  });

  // Flatten the date-keyed objects into a single array
  const neosByDate = res.data.near_earth_objects || {};
  return Object.values(neosByDate).flat();
}

/**
 * Search NASA's public image library for an image explicitly matching a NEO.
 */
export async function fetchNASAImageForNEO({ name, designation }) {
  const searchTerm = designation || name;
  if (!searchTerm) return null;

  const cached = imageSearchCache.get(searchTerm);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  const resultPromise = (async () => {
    const response = await axios.get(IMAGE_SEARCH_BASE, {
      params: { q: searchTerm, media_type: 'image', page_size: 10 },
      timeout: TIMEOUT,
    });
    const aliases = [
      designation,
      name,
      name?.replace(/^\d+\s+/, '').replace(/[()]/g, ''),
      name?.match(/\(([^)]+)\)/)?.[1],
    ]
      .filter(value => typeof value === 'string' && value.trim().length >= 4)
      .map(value => value.trim().toLowerCase());

    for (const item of response.data?.collection?.items || []) {
      const data = item.data?.[0];
      if (!data || data.media_type !== 'image' || data.copyright) continue;

      const searchableText = [
        data.title,
        data.description,
        data.description_508,
        ...(Array.isArray(data.keywords) ? data.keywords : []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!aliases.some(alias => searchableText.includes(alias))) continue;

      const image = item.links?.find(link =>
        link.render === 'image'
        && link.rel === 'canonical'
        && link.href?.startsWith('https://images-assets.nasa.gov/')
      );
      if (!image) continue;

      return {
        imageUrl: image.href,
        attribution: {
          provider: 'NASA Image and Video Library',
          title: data.title || null,
          credit: data.secondary_creator || data.photographer || data.center || 'NASA',
          nasaId: data.nasa_id || null,
        },
      };
    }

    return null;
  })();

  imageSearchCache.set(searchTerm, {
    result: resultPromise,
    expiresAt: Date.now() + IMAGE_CACHE_DURATION,
  });
  try {
    return await resultPromise;
  } catch (error) {
    imageSearchCache.delete(searchTerm);
    throw error;
  }
}

/**
 * Fetch recent Solar Flare events from NASA DONKI.
 */
export async function fetchDONKISolarFlares() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  const fmt = (d) => d.toISOString().split('T')[0];

  const res = await axios.get(`${BASE}/DONKI/FLR`, {
    params: {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      api_key: NASA_KEY,
    },
    timeout: TIMEOUT,
  });
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Fetch recent Coronal Mass Ejection events from NASA DONKI.
 */
export async function fetchDONKICMEs() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  const fmt = (d) => d.toISOString().split('T')[0];

  const res = await axios.get(`${BASE}/DONKI/CME`, {
    params: {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      api_key: NASA_KEY,
    },
    timeout: TIMEOUT,
  });
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Fetch Geomagnetic Storm events from NASA DONKI.
 */
export async function fetchDONKIGeoStorms() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);
  const fmt = (d) => d.toISOString().split('T')[0];

  const res = await axios.get(`${BASE}/DONKI/GST`, {
    params: {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      api_key: NASA_KEY,
    },
    timeout: TIMEOUT,
  });
  return Array.isArray(res.data) ? res.data : [];
}
