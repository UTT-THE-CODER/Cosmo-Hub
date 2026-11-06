export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-glow',
    secondary: 'bg-slate-800/70 text-slate-100 border border-slate-700/70',
    ghost: 'bg-transparent text-slate-200 border border-slate-700/60',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 font-medium transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] focus-ring ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
