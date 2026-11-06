/**
 * useNews.js — Custom React hook for fetching and managing news state.
 * Handles loading, error states, pagination, and category filtering.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchNews } from '../services/newsApiService';

/**
 * @param {object} options
 * @param {string} options.category   - Active category filter ('All', 'NASA', etc.)
 * @param {string} options.search     - Search query string
 * @param {number} options.limit      - Articles per page
 */
export function useNews({ category = 'All', search = '', limit = 20 } = {}) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const abortRef = useRef(null);

  const load = useCallback(
    async (pageNum = 1, append = false) => {
      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const data = await fetchNews({
          category: category === 'All' ? null : category,
          search: search || null,
          page: pageNum,
          limit,
        });

        if (data.success) {
          setArticles(prev =>
            append ? [...prev, ...data.articles] : data.articles
          );
          setTotalPages(data.pagination.totalPages);
          setTotal(data.pagination.total);
          setPage(pageNum);
        } else {
          setError(data.error || 'Failed to load news.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load news. Is the backend running?');
        }
      } finally {
        setLoading(false);
      }
    },
    [category, search, limit]
  );

  // Reload when category or search changes
  useEffect(() => {
    setArticles([]);
    setPage(1);
    load(1, false);
  }, [category, search, load]);

  const loadMore = useCallback(() => {
    if (page < totalPages && !loading) {
      load(page + 1, true);
    }
  }, [page, totalPages, loading, load]);

  const refresh = useCallback(() => {
    setArticles([]);
    load(1, false);
  }, [load]);

  return {
    articles,
    loading,
    error,
    page,
    totalPages,
    total,
    hasMore: page < totalPages,
    loadMore,
    refresh,
  };
}
