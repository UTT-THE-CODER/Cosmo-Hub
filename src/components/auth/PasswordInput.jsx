import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ label, value, onChange, placeholder = '••••••••', autoComplete }) {
  const [visible, setVisible] = useState(false);
  return <label className="block text-sm text-slate-300"><span className="mb-2 block">{label}</span><span className="relative block"><input type={visible ? 'text' : 'password'} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 pr-11 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none" /><button type="button" onClick={() => setVisible((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300" aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>;
}