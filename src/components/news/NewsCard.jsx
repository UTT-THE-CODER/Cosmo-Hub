/**
 * NewsCard.jsx — Individual news article card component.
 * Preserves the existing glass-panel design language with enhanced features.
 */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Newspaper, Calendar, FlaskConical, Satellite } from 'lucide-react';

const CATEGORY_STYLES = {
  NASA: { color: 'text-blue-300', bg: 'bg-blue-500/10 border-blue-500/30', dot: '#60a5fa' },
  SpaceX: { color: 'text-white', bg: 'bg-slate-700/50 border-slate-500/30', dot: '#e2e8f0' },
  ISRO: { color: 'text-orange-300', bg: 'bg-orange-500/10 border-orange-500/30', dot: '#fdba74' },
  ESA: { color: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/30', dot: '#fde047' },
  Astronomy: { color: 'text-violet-300', bg: 'bg-violet-500/10 border-violet-500/30', dot: '#a78bfa' },
  Exoplanets: { color: 'text-cyan-300', bg: 'bg-cyan-500/10 border-cyan-500/30', dot: '#22d3ee' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

function SourceIcon({ category }) {
  if (category === 'Astronomy') return <FlaskConical size={14} />;
  if (category === 'Exoplanets') return <Satellite size={14} />;
  return <Newspaper size={14} />;
}

export default function NewsCard({ article, index = 0 }) {
  const style = CATEGORY_STYLES[article.category] || CATEGORY_STYLES.NASA;
  const dateStr = formatDate(article.published_at);
  const isResearch = article.category === 'Astronomy';

  return (
    <Link
      to={`/news/${article.id}`}
      aria-label={`Read article: ${article.title}`}
      className="group block h-full rounded-[1.6rem] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
    >
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.04 }}
        className="glass-panel flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-slate-700/80 transition-colors group-hover:border-cyan-400/50"
      >
        {article.image_url && (
          <div className="relative h-44 overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.target.closest('.relative')?.classList.add('hidden'); }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-cyan-300">
              <SourceIcon category={article.category} />
              <span className="text-xs font-semibold uppercase tracking-[0.22em]">
                {article.source}
              </span>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${style.color} ${style.bg}`}>
              {article.category}
            </span>
          </div>

          {isResearch && (
            <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300">
              <FlaskConical size={11} />
              Research Paper
            </div>
          )}

          <h3 className="line-clamp-2 flex-grow text-base font-semibold leading-snug text-slate-50">
            {article.title}
          </h3>

          {dateStr && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar size={12} />
              {dateStr}
            </p>
          )}

          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
            {article.description}
          </p>

          <span className="mt-4 inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-400 transition-colors duration-200 group-hover:text-cyan-200">
            {isResearch ? 'View paper details' : 'Read article'}
            <ArrowRight size={14} />
          </span>
        </div>
      </motion.article>
    </Link>
  );
}
