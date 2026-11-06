import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

export async function requireSupabaseUser(req, res, next) {
  const authorization = req.get('authorization') || '';
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return res.status(401).json({ success: false, error: 'Sign in to manage quote favorites.' });
  }
  if (!supabaseUrl || !supabasePublishableKey) {
    return res.status(503).json({ success: false, error: 'Quote favorites require Supabase URL and publishable key configuration on the backend.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/auth/v1/user`, {
      headers: {
        apikey: supabasePublishableKey,
        Authorization: `Bearer ${tokenMatch[1]}`,
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      return res.status(401).json({ success: false, error: 'Your session is invalid or has expired.' });
    }

    const user = await response.json();
    if (typeof user.id !== 'string') {
      return res.status(401).json({ success: false, error: 'Your session is invalid or has expired.' });
    }

    req.authenticatedUserId = user.id;
    return next();
  } catch (error) {
    console.error('[Quotes] Supabase session verification failed:', error.message);
    return res.status(503).json({ success: false, error: 'Could not verify your session. Please try again.' });
  } finally {
    clearTimeout(timeout);
  }
}
