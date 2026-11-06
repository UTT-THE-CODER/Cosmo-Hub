import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Sparkles, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { fetchFavoriteQuotes, fetchQuotes } from '../services/quoteApiService';
import SectionHeader from '../components/common/SectionHeader';

const moodOptions = ['Curious', 'Dreamy', 'Focused', 'Adventurous', 'Calm', 'Inspired'];
const emojiOptions = ['🚀', '🌙', '🪐', '✨', '☄️', '🌌'];

export default function MyCosmos() {
  const { user, session, loading: authLoading } = useAuth();
  const [favoriteQuotes, setFavoriteQuotes] = useState([]);
  const [favoriteQuotesError, setFavoriteQuotesError] = useState('');
  const [customLines, setCustomLines] = useState([]);
  const [favoriteEmojis, setFavoriteEmojis] = useState([]);
  const [savedPlanets, setSavedPlanets] = useState([]);
  const [mood, setMood] = useState('Curious');
  const [draftLine, setDraftLine] = useState('');

  useEffect(() => {
    setFavoriteQuotes([]);
    setFavoriteQuotesError('');
    if (authLoading) return undefined;
    let active = true;

    const loadFavoriteQuotes = user
      ? session?.access_token
        ? fetchFavoriteQuotes(session.access_token)
        : Promise.reject(new Error('Sign in again to load your quote favorites.'))
      : fetchQuotes().then(quotes => {
        const favoriteIds = storageService.getFavoriteQuotes();
        return quotes.filter(quote => favoriteIds.includes(quote.id));
      });

    loadFavoriteQuotes
      .then(quotes => {
        if (active) setFavoriteQuotes(quotes);
      })
      .catch(error => {
        if (active) setFavoriteQuotesError(error.message || 'Could not load quote favorites.');
      });
    setCustomLines(storageService.getCustomLines());
    setFavoriteEmojis(storageService.getFavoriteEmojis());
    setSavedPlanets(storageService.getSavedPlanets());
    setMood(storageService.getMood());

    return () => {
      active = false;
    };
  }, [authLoading, session?.access_token, user]);

  const addLine = () => {
    const clean = draftLine.trim();
    if (!clean) return;
    const next = [...customLines, clean];
    setCustomLines(next);
    storageService.setCustomLines(next);
    setDraftLine('');
  };

  const toggleEmoji = (emoji) => {
    const next = favoriteEmojis.includes(emoji)
      ? favoriteEmojis.filter((item) => item !== emoji)
      : [...favoriteEmojis, emoji];
    setFavoriteEmojis(next);
    storageService.setFavoriteEmojis(next);
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
        eyebrow="Personal"
        title="My Cosmos"
        text="A place for favorite ideas, saved worlds, and your own cosmic moodboard."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
          <div className="mb-3 flex items-center gap-2 text-cyan-300">
            <Star size={18} />
            <h3 className="text-lg font-semibold">Favorite Quotes</h3>
          </div>
          <div className="space-y-3">
            {favoriteQuotesError && <p role="alert" className="text-sm text-rose-200">{favoriteQuotesError}</p>}
            {favoriteQuotes.length ? (
              favoriteQuotes.map((quote) => (
                <div key={quote.id} className="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-200">
                  “{quote.text}”
                  <div className="mt-1 text-xs text-slate-400">— {quote.author}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No favorite quotes yet. Visit the quotes page to save some inspiration.</p>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
          <div className="mb-3 flex items-center gap-2 text-violet-300">
            <Sparkles size={18} />
            <h3 className="text-lg font-semibold">Cosmic Mood</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {moodOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setMood(option);
                  storageService.setMood(option);
                }}
                className={`rounded-full px-3 py-2 text-sm ${mood === option ? 'bg-violet-400 text-slate-950' : 'border border-slate-700 bg-slate-900/60 text-slate-200'}`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-300">Current mood: <span className="font-medium text-white">{mood}</span></p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
          <h3 className="mb-3 text-lg font-semibold text-cyan-300">My Lines</h3>
          <div className="flex gap-2">
            <input
              value={draftLine}
              onChange={(e) => setDraftLine(e.target.value)}
              placeholder="Write a line from the cosmos..."
              className="w-full rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button onClick={addLine} className="rounded-full bg-cyan-400 px-3 py-2 text-sm font-medium text-slate-950">
              <Plus size={16} />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {customLines.length ? customLines.map((line, index) => (
              <div key={`${line}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-200">
                <span>“{line}”</span>
                <button
                  onClick={() => {
                    const next = customLines.filter((_, i) => i !== index);
                    setCustomLines(next);
                    storageService.setCustomLines(next);
                  }}
                  className="text-slate-400"
                  aria-label="Delete line"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )) : <p className="text-sm text-slate-400">No personal lines yet.</p>}
          </div>
        </div>

        <div className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
          <h3 className="mb-3 text-lg font-semibold text-violet-300">Favorite Emojis</h3>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleEmoji(emoji)}
                className={`flex h-12 w-12 items-center justify-center rounded-full border text-xl ${favoriteEmojis.includes(emoji) ? 'border-cyan-300 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/60'}`}
                aria-label={`Toggle ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
        <h3 className="mb-3 text-lg font-semibold text-cyan-300">Saved Planets</h3>
        {savedPlanets.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {savedPlanets.map((planet) => (
              <div key={planet.id} className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-full border border-white/20"
                      style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${planet.color})` }}
                    />
                    <div>
                      <div className="font-medium text-slate-50">{planet.name}</div>
                      <div className="text-xs text-slate-400">{planet.gravityPercent}% Earth gravity</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const next = savedPlanets.filter((item) => item.id !== planet.id);
                      setSavedPlanets(next);
                      storageService.setSavedPlanets(next);
                    }}
                    aria-label={`Delete ${planet.name}`}
                    className="text-slate-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No saved planets yet. Use the Planet Lab to create and save your first world.</p>
        )}
      </div>
    </motion.div>
  );
}
