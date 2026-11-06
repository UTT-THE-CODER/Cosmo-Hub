import {
  addQuoteFavorite,
  getDailyQuote,
  getQuoteFavorites,
  getQuotes,
  removeQuoteFavorite,
} from './quoteStore.js';

const QUOTE_CATEGORIES = new Set(['Science', 'Inspiration', 'Discovery', 'Perspective']);

export async function handleGetQuotes(req, res) {
  const category = req.query.category || null;
  if (category && !QUOTE_CATEGORIES.has(category)) {
    return res.status(400).json({ success: false, error: 'Unknown quote category.' });
  }
  try {
    const quotes = await getQuotes(category);
    return res.json({ success: true, quotes });
  } catch (error) {
    console.error('[Quotes] Query failed:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve quotes.' });
  }
}

export async function handleGetDailyQuote(_req, res) {
  try {
    const date = new Date();
    const quote = await getDailyQuote(date);
    if (!quote) return res.status(503).json({ success: false, error: 'No quotes are available.' });
    return res.json({ success: true, date: date.toISOString().slice(0, 10), quote });
  } catch (error) {
    console.error('[Quotes] Daily quote query failed:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve the daily quote.' });
  }
}

export async function handleGetQuoteFavorites(req, res) {
  try {
    const quotes = await getQuoteFavorites(req.authenticatedUserId);
    return res.json({ success: true, quotes });
  } catch (error) {
    console.error('[Quotes] Favorites query failed:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to retrieve quote favorites.' });
  }
}

export async function handleAddQuoteFavorite(req, res) {
  const { quoteId } = req.params;
  if (!/^[a-z0-9-]{1,96}$/i.test(quoteId)) {
    return res.status(400).json({ success: false, error: 'Invalid quote ID.' });
  }
  try {
    const added = await addQuoteFavorite(req.authenticatedUserId, quoteId);
    if (!added) {
      const quotes = await getQuotes();
      if (!quotes.some(quote => quote.id === quoteId)) {
        return res.status(404).json({ success: false, error: 'Quote not found.' });
      }
    }
    return res.json({ success: true, favorite: true });
  } catch (error) {
    console.error('[Quotes] Favorite save failed:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to save quote favorite.' });
  }
}

export async function handleRemoveQuoteFavorite(req, res) {
  const { quoteId } = req.params;
  if (!/^[a-z0-9-]{1,96}$/i.test(quoteId)) {
    return res.status(400).json({ success: false, error: 'Invalid quote ID.' });
  }
  try {
    await removeQuoteFavorite(req.authenticatedUserId, quoteId);
    return res.json({ success: true, favorite: false });
  } catch (error) {
    console.error('[Quotes] Favorite removal failed:', error.message);
    return res.status(500).json({ success: false, error: 'Failed to remove quote favorite.' });
  }
}
