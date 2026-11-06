import { Router } from 'express';
import { requireSupabaseUser } from './quoteAuth.js';
import {
  handleAddQuoteFavorite,
  handleGetDailyQuote,
  handleGetQuoteFavorites,
  handleGetQuotes,
  handleRemoveQuoteFavorite,
} from './quoteController.js';

const router = Router();

router.get('/daily', handleGetDailyQuote);
router.get('/favorites', requireSupabaseUser, handleGetQuoteFavorites);
router.post('/favorites/:quoteId', requireSupabaseUser, handleAddQuoteFavorite);
router.delete('/favorites/:quoteId', requireSupabaseUser, handleRemoveQuoteFavorite);
router.get('/', handleGetQuotes);

export default router;
