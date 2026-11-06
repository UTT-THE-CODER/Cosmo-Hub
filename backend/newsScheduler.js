/**
 * newsScheduler.js — Automated news fetching using node-cron.
 * Fetches each source independently every 30 minutes.
 * Individual source failures do not affect others.
 */
import cron from 'node-cron';
import {
  fetchAndStoreNASA,
  fetchAndStoreSpaceX,
  fetchAndStoreISRO,
  fetchAndStoreESA,
  fetchAndStoreAstronomy,
  fetchAndStoreExoplanets,
  fetchAndStoreAll,
} from './newsController.js';

let isRunning = false;

/**
 * Run a single fetch task with error isolation and logging.
 */
async function runTask(name, fn) {
  const start = Date.now();
  try {
    console.log(`[Scheduler] Starting ${name}...`);
    await fn();
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[Scheduler] ✓ ${name} done in ${elapsed}s`);
  } catch (err) {
    console.error(`[Scheduler] ✗ ${name} FAILED:`, err.message);
  }
}

/**
 * Start all scheduled fetch jobs.
 * - All sources: every 30 minutes
 * - NASA APOD specifically: once per day at midnight
 * - Exoplanets: every 6 hours (data doesn't change often)
 */
export function startScheduler() {
  console.log('[Scheduler] Starting news fetch scheduler...');

  // Full refresh every 30 minutes — stagger sources to avoid rate limits
  cron.schedule('*/30 * * * *', async () => {
    if (isRunning) {
      console.log('[Scheduler] Previous run still in progress, skipping.');
      return;
    }
    isRunning = true;
    try {
      await Promise.allSettled([
        runTask('NASA', fetchAndStoreNASA),
        runTask('SpaceX', fetchAndStoreSpaceX),
        runTask('ESA', fetchAndStoreESA),
        runTask('Astronomy', fetchAndStoreAstronomy),
      ]);
    } finally {
      isRunning = false;
    }
  });

  // ISRO data doesn't update frequently — every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    await runTask('ISRO', fetchAndStoreISRO);
  });

  // Exoplanet data updates infrequently — every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    await runTask('Exoplanets', fetchAndStoreExoplanets);
  });

  console.log('[Scheduler] ✓ All cron jobs registered.');
  console.log('[Scheduler]   - Full news: every 30 minutes');
  console.log('[Scheduler]   - ISRO: every 2 hours');
  console.log('[Scheduler]   - Exoplanets: every 6 hours');
}

/**
 * Run an initial full fetch immediately on startup.
 * This populates the database before the first cron fires.
 */
export async function initialFetch() {
  console.log('[Scheduler] Running initial data fetch on startup...');
  isRunning = true;
  try {
    await fetchAndStoreAll();
  } catch (err) {
    console.error('[Scheduler] Initial fetch error:', err.message);
  } finally {
    isRunning = false;
  }
}
