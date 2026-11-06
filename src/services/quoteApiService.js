const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { token, ...options } = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Quote request failed (${response.status}).`);
  return data;
}

export async function fetchQuotes(category = 'All') {
  const params = new URLSearchParams();
  if (category !== 'All') params.set('category', category);
  const query = params.toString();
  const data = await request(`/quotes${query ? `?${query}` : ''}`);
  return data.quotes;
}

export async function fetchDailyQuote() {
  const data = await request('/quotes/daily');
  return data;
}

export async function fetchFavoriteQuotes(token) {
  const data = await request('/quotes/favorites', { token });
  return data.quotes;
}

export async function setQuoteFavorite(token, quoteId, favorite) {
  const method = favorite ? 'POST' : 'DELETE';
  return request(`/quotes/favorites/${encodeURIComponent(quoteId)}`, { token, method });
}
