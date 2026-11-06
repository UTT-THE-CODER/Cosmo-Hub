import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { planets } from '../data/planets';
import SectionHeader from '../components/common/SectionHeader';

export default function Discover() {
  const [query, setQuery] = useState('');

  const filteredPlanets = useMemo(() => {
    return planets.filter((planet) =>
      planet.name.toLowerCase().includes(query.toLowerCase()) ||
      planet.description.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <SectionHeader
        eyebrow="Discover"
        title="Explore the Solar System"
        text="From cratered mercurial worlds to giant gas planets, each world has a distinctive story and atmosphere."
      />

      <div className="glass-panel flex items-center gap-3 rounded-full border border-slate-700/70 px-4 py-3">
        <Search size={18} className="text-slate-400" />
        <input
          aria-label="Search planets"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search planets..."
          className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlanets.map((planet) => (
          <div key={planet.id} className="glass-panel rounded-[1.6rem] border border-slate-700/80 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-full border border-white/20"
                  style={{ background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), ${planet.color})` }}
                />
                <div>
                  <h3 className="text-xl font-semibold">{planet.name}</h3>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{planet.moons} moons</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-300">{planet.description}</p>
            <div className="mt-5 grid gap-2 text-sm text-slate-300">
              <div><span className="text-slate-400">Gravity:</span> {planet.gravity} m/s²</div>
              <div><span className="text-slate-400">Temperature:</span> {planet.temperature}</div>
              <div><span className="text-slate-400">Atmosphere:</span> {planet.atmosphere}</div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {planet.facts.slice(0, 2).map((fact) => (
                <span key={fact} className="rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs text-cyan-200">
                  {fact}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
