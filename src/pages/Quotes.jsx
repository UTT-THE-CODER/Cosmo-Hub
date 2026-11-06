import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Heart, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import {
  fetchDailyQuote,
  fetchFavoriteQuotes,
  fetchQuotes,
  setQuoteFavorite,
} from '../services/quoteApiService';
import SectionHeader from '../components/common/SectionHeader';

const categories = ['All', 'Science', 'Inspiration', 'Discovery', 'Perspective'];

export default function Quotes() {
  const { user, session, loading: authLoading } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [daily, setDaily] = useState(null);
  const [filter, setFilter] = useState('All');
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [error, setError] = useState('');
  const [favoriteError, setFavoriteError] = useState('');
  const [actionError, setActionError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoadingQuotes(true);
    setError('');
    fetchQuotes(filter)
      .then(data => {
        if (active) setQuotes(data);
      })
      .catch(fetchError => {
        if (active) setError(fetchError.message || 'Could not load quotes.');
      })
      .finally(() => {
        if (active) setLoadingQuotes(false);
      });
    return () => {
      active = false;
    };
  }, [filter]);

  useEffect(() => {
    let active = true;
    fetchDailyQuote()
      .then(data => {
        if (active) setDaily(data);
      })
      .catch(fetchError => {
        if (active) setActionError(fetchError.message || 'Could not load the daily quote.');
      })
      .finally(() => {
        if (active) setLoadingDaily(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setFavoriteIds([]);
    setFavoriteError('');
    if (authLoading) return undefined;
    let active = true;

    if (user) {
      const token = session?.access_token;
      if (!token) {
        setFavoriteIds([]);
        setFavoriteError('Sign in again to load your quote favorites.');
        return undefined;
      }
      fetchFavoriteQuotes(token)
        .then(favorites => {
          if (active) setFavoriteIds(favorites.map(quote => quote.id));
        })
        .catch(fetchError => {
          if (active) setFavoriteError(fetchError.message || 'Could not load quote favorites.');
        });
    } else {
      setFavoriteIds(storageService.getFavoriteQuotes());
    }

    return () => {
      active = false;
    };
  }, [authLoading, session?.access_token, user]);

  const toggleFavorite = async (quote) => {
    const isFavorite = favoriteIds.includes(quote.id);
    setPendingId(quote.id);
    setActionError('');
    try {
      if (user) {
        if (!session?.access_token) throw new Error('Sign in again to manage quote favorites.');
        await setQuoteFavorite(session.access_token, quote.id, !isFavorite);
      } else {
        const next = isFavorite
          ? favoriteIds.filter(id => id !== quote.id)
          : [...favoriteIds, quote.id];
        storageService.setFavoriteQuotes(next);
      }
      setFavoriteIds(previous => (
        isFavorite
          ? previous.filter(id => id !== quote.id)
          : [...previous, quote.id]
      ));
    } catch (favoriteActionError) {
      setActionError(favoriteActionError.message || 'Could not update this favorite.');
    } finally {
      setPendingId(null);
    }
  };

  const copyQuote = async (quote) => {
    try {
      await navigator.clipboard.writeText(`“${quote.text}” — ${quote.author}`);
      setCopiedId(quote.id);
      setActionError('');
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setActionError('Clipboard access is unavailable in this browser.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <SectionHeader
        eyebrow="Inspiration"
        title="Space Quotes"
        text="Discover sourced reflections on science, curiosity, and our place in the cosmos."
      />

      <section aria-label="Quote of the day" className="glass-panel rounded-[1.8rem] border border-slate-700/80 p-6">
        <div className="flex items-center gap-3 text-cyan-300">
          <Star size={18} />
          <span className="text-xs uppercase tracking-[0.28em]">Quote of the day</span>
          {daily?.date && <time className="ml-auto text-xs text-slate-500">{daily.date} UTC</time>}
        </div>
        {loadingDaily ? (
          <p role="status" className="mt-4 text-sm text-slate-400">Loading today’s quote…</p>
        ) : daily?.quote ? (
          <>
            <p className="mt-4 text-2xl font-medium italic text-slate-100">“{daily.quote.text}”</p>
            <p className="mt-4 text-sm text-slate-300">— {daily.quote.author}</p>
            <p className="mt-2 text-xs text-slate-500">
              {daily.quote.source}
              {daily.quote.source_url && (
                <> · <a className="text-cyan-300 hover:text-cyan-100" href={daily.quote.source_url} target="_blank" rel="noopener noreferrer">Source</a></>
              )}
            </p>
          </>
        ) : (
          <p role="alert" className="mt-4 text-sm text-rose-200">{actionError || 'Today’s quote is unavailable.'}</p>
        )}
      </section>

      <div className="flex flex-wrap gap-2" aria-label="Filter quotes by category">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            aria-pressed={filter === category}
            className={`rounded-full px-3 py-2 text-sm transition ${
              filter === category
                ? 'bg-violet-400 text-slate-950'
                : 'border border-slate-700 bg-slate-900/60 text-slate-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {(favoriteError || actionError) && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/5 p-3 text-sm text-rose-200">
          {favoriteError || actionError}
        </p>
      )}

      {loadingQuotes && <p role="status" className="text-sm text-slate-400">Loading quotes…</p>}
      {!loadingQuotes && error && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/5 p-4 text-sm text-rose-200">{error}</p>
      )}
      {!loadingQuotes && !error && quotes.length === 0 && (
        <p className="glass-panel rounded-2xl border border-slate-700/80 p-5 text-sm text-slate-400">
          No quotes are available in this category yet.
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {quotes.map(quote => {
          const favorite = favoriteIds.includes(quote.id);
          return (
            <article key={quote.id} className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300">{quote.category}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyQuote(quote)}
                    className="rounded-full border border-slate-700 p-2 text-slate-200"
                    aria-label={`Copy quote by ${quote.author}`}
                  >
                    <Copy size={15} />
                  </button>
                  <button
                    onClick={() => toggleFavorite(quote)}
                    disabled={pendingId === quote.id}
                    className={`rounded-full border p-2 ${favorite ? 'border-rose-400 bg-rose-500/15 text-rose-300' : 'border-slate-700 text-slate-200'}`}
                    aria-label={favorite ? `Remove quote by ${quote.author} from favorites` : `Add quote by ${quote.author} to favorites`}
                    aria-pressed={favorite}
                  >
                    <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
              {copiedId === quote.id && <p className="mt-2 text-right text-xs text-cyan-300" role="status">Copied</p>}
              <p className="mt-5 text-lg leading-8 text-slate-100">“{quote.text}”</p>
              <p className="mt-4 text-sm text-slate-300">— {quote.author}</p>
              <p className="mt-2 text-xs text-slate-500">
                {quote.source}
                {quote.source_url && (
                  <> · <a className="text-cyan-300 hover:text-cyan-100" href={quote.source_url} target="_blank" rel="noopener noreferrer">Source</a></>
                )}
              </p>
            </article>
          );
        })}
      </div>
    </motion.div>
  );
}
