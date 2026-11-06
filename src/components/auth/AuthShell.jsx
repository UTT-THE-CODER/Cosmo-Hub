import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Sparkles } from 'lucide-react';

export default function AuthShell({ eyebrow, title, text, children, footer }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto flex min-h-[calc(100vh-13rem)] max-w-5xl items-center justify-center py-8">
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-slate-700/70 bg-slate-950/60 shadow-2xl shadow-violet-950/30 backdrop-blur-xl md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-cyan-500/15 via-slate-900 to-violet-600/20 p-10 md:flex">
          <div className="absolute -right-20 top-16 h-48 w-48 rounded-full border border-cyan-300/20 shadow-glow" />
          <div className="absolute bottom-10 left-8 h-24 w-24 rounded-full border border-violet-300/20" />
          <Link to="/" className="relative flex items-center gap-3 text-slate-50"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950"><Rocket size={19} /></span><span className="text-xl font-semibold tracking-wide">Cosmos Hub</span></Link>
          <div className="relative"><Sparkles className="mb-5 text-cyan-300" size={25} /><p className="max-w-xs text-2xl font-semibold leading-tight text-slate-100">Your corner of the universe, ready when you are.</p><p className="mt-4 text-sm leading-6 text-slate-400">Keep the ideas, worlds, and moods that make your exploration yours.</p></div>
          <p className="relative text-xs uppercase tracking-[0.24em] text-slate-500">Explore · Discover · Experiment</p>
        </div>
        <div className="p-6 sm:p-10">
          <div className="mb-8 md:hidden"><Link to="/" className="flex items-center gap-3 text-lg font-semibold"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950"><Rocket size={17} /></span>Cosmos Hub</Link></div>
          <div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold text-white">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></div>
          {children}
          {footer && <div className="mt-7 border-t border-slate-800 pt-5 text-center text-sm text-slate-400">{footer}</div>}
        </div>
      </div>
    </motion.div>
  );
}