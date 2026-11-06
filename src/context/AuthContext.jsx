import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function authErrorMessage(error) {
  if (error?.message === 'AUTH_NOT_CONFIGURED') return 'Authentication is not configured yet.';
  const message = error?.message?.toLowerCase() || '';
  if (message.includes('invalid login credentials')) return 'Invalid email or password.';
  if (message.includes('already registered') || message.includes('already been registered')) return 'This email is already registered.';
  if (message.includes('email not confirmed')) return 'Please confirm your email before signing in.';
  if (message.includes('rate limit')) return 'Too many attempts. Please wait a moment and try again.';
  return 'Something went wrong. Please try again.';
}

function requireClient() {
  if (!supabase) throw new Error('AUTH_NOT_CONFIGURED');
  return supabase;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    signUp: async ({ email, password, displayName }) => {
      const client = requireClient();
      return client.auth.signUp({ email, password, options: { data: { display_name: displayName } } });
    },
    signIn: async ({ email, password }) => requireClient().auth.signInWithPassword({ email, password }),
    signOut: async () => requireClient().auth.signOut(),
    resetPassword: async (email) => requireClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }),
    updatePassword: async (password) => requireClient().auth.updateUser({ password }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
