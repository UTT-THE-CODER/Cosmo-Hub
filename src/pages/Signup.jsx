import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthShell from '../components/auth/AuthShell';
import PasswordInput from '../components/auth/PasswordInput';
import { authErrorMessage, useAuth } from '../context/AuthContext';

const inputClass = 'w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.displayName.trim()) return setError('Please enter your display name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Please enter a valid email.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (!form.confirmPassword) return setError('Please confirm your password.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setError('');
    setSubmitting(true);
    const { data, error: requestError } = await signUp(form).catch((requestError) => ({ error: requestError, data: null }));
    setSubmitting(false);
    if (requestError) return setError(authErrorMessage(requestError));
    if (data?.session) return navigate('/my-cosmos', { replace: true });
    setSuccess('Your account is ready. Check your email to confirm it, then sign in.');
  };

  return <AuthShell eyebrow="Join the expedition" title="Create your cosmos" text="Save discoveries, build worlds, and make the universe a little more personal." footer={<>Already have an account? <Link className="font-medium text-cyan-300 hover:text-cyan-200" to="/login">Sign in</Link></>}>
    <form onSubmit={submit} className="space-y-4">
      {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      {success && <p role="status" className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">{success}</p>}
      <label className="block text-sm text-slate-300"><span className="mb-2 block">Display name</span><input className={inputClass} value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} autoComplete="name" placeholder="Stargazer" /></label>
      <label className="block text-sm text-slate-300"><span className="mb-2 block">Email</span><input className={inputClass} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" placeholder="you@example.com" /></label>
      <PasswordInput label="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="new-password" />
      <PasswordInput label="Confirm password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} autoComplete="new-password" />
      <p className="text-xs text-slate-500">Use at least 8 characters.</p>
      <button disabled={submitting || Boolean(success)} className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950 shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Creating account...' : 'Create account'}</button>
    </form>
  </AuthShell>;
}
