import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthShell from '../components/auth/AuthShell';
import PasswordInput from '../components/auth/PasswordInput';
import { authErrorMessage, useAuth } from '../context/AuthContext';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setError('');
    setSubmitting(true);
    const { error: requestError } = await updatePassword(password).catch((requestError) => ({ error: requestError }));
    setSubmitting(false);
    if (requestError) return setError(authErrorMessage(requestError));
    navigate('/login', { replace: true, state: { resetComplete: true } });
  };

  return <AuthShell eyebrow="New coordinates" title="Set a new password" text="Choose a fresh password for your Cosmos Hub account." footer={<Link className="font-medium text-cyan-300 hover:text-cyan-200" to="/login">Return to sign in</Link>}><form onSubmit={submit} className="space-y-5">{error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</p>}<PasswordInput label="New password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /><PasswordInput label="Confirm new password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /><p className="text-xs text-slate-500">Use at least 8 characters.</p><button disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-slate-950 shadow-glow disabled:opacity-60">{submitting ? 'Updating password...' : 'Update password'}</button></form></AuthShell>;
}
