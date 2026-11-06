import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import SectionHeader from '../components/common/SectionHeader';
import NewsCard from '../components/news/NewsCard';
import { useNews } from '../hooks/useNews';

const categories = ['All', 'NASA', 'SpaceX', 'ISRO', 'ESA', 'Astronomy', 'Exoplanets'];

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { articles, loading, error, hasMore, loadMore, refresh } = useNews({
    category: selectedCategory,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <SectionHeader
        eyebrow="Operations"
        title="Space News"
        text="The latest space science and exploration updates from our news sources."
      />

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-3 py-2 text-sm transition ${
              selectedCategory === category
                ? 'bg-cyan-400 text-slate-950'
                : 'border border-slate-700 bg-slate-900/60 text-slate-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-400/30 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <button onClick={refresh} className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100">
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      )}

      {loading && articles.length === 0 && (
        <p role="status" className="text-sm text-slate-400">Loading the latest news…</p>
      )}

      {!loading && !error && articles.length === 0 && (
        <p className="glass-panel rounded-2xl border border-slate-700/80 p-5 text-sm text-slate-400">
          No articles are available yet. Try again after the news feed has been refreshed.
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {articles.map((article, index) => (
          <NewsCard key={article.id} article={article} index={index} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-slate-700 bg-slate-900/60 px-5 py-2.5 text-sm font-medium text-cyan-300 transition hover:border-cyan-400/50 disabled:cursor-wait disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
