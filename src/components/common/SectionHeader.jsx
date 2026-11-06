export default function SectionHeader({ eyebrow, title, text, align = 'left' }) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`mb-8 max-w-2xl ${alignClass}`}>
      {eyebrow && <p className="mb-3 text-xs uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</p>}
      <h2 className="text-3xl font-semibold text-slate-50 md:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-base text-slate-300">{text}</p>}
    </div>
  );
}
