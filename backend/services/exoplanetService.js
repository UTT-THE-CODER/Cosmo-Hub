/**
 * exoplanetService.js — Fetches confirmed exoplanet data from NASA Exoplanet Archive TAP API.
 * API: https://exoplanetarchive.ipac.caltech.edu/TAP/sync
 * Returns planets with all available attributes: name, host star, discovery year,
 * radius, mass, orbital period, distance.
 */
import axios from 'axios';

const TAP_BASE = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';
const TIMEOUT = 20000; // TAP queries can be slower

/**
 * Fetch recently discovered confirmed exoplanets.
 * Fields: pl_name, hostname, disc_year, pl_rade, pl_bmasse, pl_orbper, sy_dist
 * Ordered by discovery year descending, limited to 200 records.
 */
export async function fetchExoplanets(limit = 200) {
  const query = [
    'SELECT',
    'pl_name,hostname,disc_year,pl_rade,pl_bmasse,pl_orbper,sy_dist',
    'FROM ps',
    'WHERE disc_year IS NOT NULL',
    'ORDER BY disc_year DESC',
    `LIMIT ${limit}`,
  ].join(' ');

  const res = await axios.get(TAP_BASE, {
    params: { query, format: 'json' },
    timeout: TIMEOUT,
  });

  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Fetch a single exoplanet by name.
 */
export async function fetchExoplanetByName(name) {
  const query = `SELECT pl_name,hostname,disc_year,pl_rade,pl_bmasse,pl_orbper,sy_dist FROM ps WHERE pl_name='${name.replace(/'/g, "''")}'`;
  const res = await axios.get(TAP_BASE, {
    params: { query, format: 'json' },
    timeout: TIMEOUT,
  });
  const data = Array.isArray(res.data) ? res.data : [];
  return data[0] || null;
}
