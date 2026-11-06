/**
 * newsApiService.js — Frontend service for fetching space news from the Cosmo Hub backend.
 * All calls go through the Express backend — API keys are never exposed here.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with timeout and error handling.
 */
async function apiFetch(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch news articles with optional filters.
 * @param {object} params
 * @param {string} [params.category]     - Filter by category ('NASA', 'SpaceX', etc.)
 * @param {string} [params.search]       - Keyword search
 * @param {number} [params.page=1]       - Page number
 * @param {number} [params.limit=20]     - Articles per page
 * @param {string} [params.sort]         - Sort field
 * @param {string} [params.order]        - 'ASC' or 'DESC'
 */
export async function fetchNews({
  category = null,
  search = null,
  page = 1,
  limit = 20,
  sort = 'published_at',
  order = 'DESC',
} = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (search) params.set('search', search);
  params.set('page', String(page));
  params.set('limit', String(limit));
  params.set('sort', sort);
  params.set('order', order);

  const query = params.toString();
  return apiFetch(`/news${query ? `?${query}` : ''}`);
}

/**
 * Fetch a stored article by its database ID.
 */
export async function fetchNewsArticle(id) {
  return apiFetch(`/news/${encodeURIComponent(id)}`);
}

/**
 * Fetch category-specific news endpoints.
 */
export const fetchNASANews = (params = {}) => fetchNews({ ...params, category: 'NASA' });
export const fetchSpaceXNews = (params = {}) => fetchNews({ ...params, category: 'SpaceX' });
export const fetchISRONews = (params = {}) => fetchNews({ ...params, category: 'ISRO' });
export const fetchESANews = (params = {}) => fetchNews({ ...params, category: 'ESA' });
export const fetchAstronomyNews = (params = {}) => fetchNews({ ...params, category: 'Astronomy' });
export const fetchExoplanetsNews = (params = {}) => fetchNews({ ...params, category: 'Exoplanets' });

/**
 * Fetch NASA Astronomy Picture of the Day.
 */
export async function fetchAPOD() {
  return apiFetch('/news/apod');
}

/**
 * Fetch SpaceX launches.
 */
export async function fetchLaunches({ upcoming = false, limit = 10 } = {}) {
  return apiFetch(`/news/launches?upcoming=${upcoming}&limit=${limit}`);
}

/**
 * Fetch exoplanet database records.
 */
export async function fetchExoplanets({ page = 1, limit = 50 } = {}) {
  return apiFetch(`/news/exoplanets-data?page=${page}&limit=${limit}`);
}

/**
 * Check backend health.
 */
export async function checkHealth() {
  return apiFetch('/health');
}
