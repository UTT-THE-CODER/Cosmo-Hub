import { Link } from 'react-router-dom';
import { useState } from 'react';
import AuthShell from '../components/auth/AuthShell';
import { authErrorMessage, useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email.');
    setError('');
    setSubmitting(true);
    const { error: requestError } = await resetPassword(email).catch((requestError) => ({ error: requestError }));
    setSubmitting(false);
    if (requestError) return setError(authErrorMessage(requestError));
    setSent(true);
  };

  return <AuthShell eyebrow="Account recovery" title="Find your way back" text="Enter your email and we will send a secure link if an account exists for it." footer={<Link className="font-medium text-cyan-300 hover:text-cyan-200" to="/login">Return to sign in</Link>}>
    {sent ? <div className="space-y-5"><p role="status" className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-100">If an account exists for this email, a password reset link has been sent.</p><Link to="/login" className="block w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-center font-semibold text-slate-950">Back to sign in</Link></div> : <form onSubmit={submit} className="space-y-5">{error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}<label className="block text-sm text-slate-300"><span className="mb-2 block">Email</span><input className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="you@example.com" /></label><button disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950 shadow-glow disabled:opacity-60">{submitting ? 'Sending link...' : 'Send reset link'}</button></form>}
  </AuthShell>;
}
