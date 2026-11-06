import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthShell from '../components/auth/AuthShell';
import PasswordInput from '../components/auth/PasswordInput';
import { authErrorMessage, useAuth } from '../context/AuthContext';

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const resetComplete = Boolean(location.state?.resetComplete);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.email.trim()) return setError('Please enter your email.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email.');
    if (!form.password) return setError('Please enter your password.');
    setError('');
    setSubmitting(true);
    const { error: requestError } = await signIn(form).catch((requestError) => ({ error: requestError }));
    setSubmitting(false);
    if (requestError) return setError(authErrorMessage(requestError));
    const destination = location.state?.from?.pathname || '/my-cosmos';
    navigate(destination, { replace: true });
  };

  return <AuthShell eyebrow="Welcome back" title="Return to your cosmos" text="Sign in to pick up your saved worlds and favorite ideas." footer={<>New to Cosmos Hub? <Link className="font-medium text-cyan-300 hover:text-cyan-200" to="/signup">Create an account</Link></>}>
    <form onSubmit={submit} className="space-y-5">
      {resetComplete && <p role="status" className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">Your password has been updated. You can sign in now.</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      <label className="block text-sm text-slate-300"><span className="mb-2 block">Email</span><input className={inputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" placeholder="you@example.com" /></label>
      <PasswordInput label="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" />
      <div className="flex justify-end"><Link to="/forgot-password" className="text-sm text-cyan-300 hover:text-cyan-200">Forgot password?</Link></div>
      <button disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950 shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Signing in...' : 'Sign in'}</button>
    </form>
  </AuthShell>;
}
