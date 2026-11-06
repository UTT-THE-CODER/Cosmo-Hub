/**
 * spacexService.js — Fetches data from the unofficial SpaceX API v4.
 * Community-maintained API: https://api.spacexdata.com/v4
 * Handles unavailability gracefully.
 */
import axios from 'axios';

const BASE = 'https://api.spacexdata.com/v4';
const TIMEOUT = 12000;

/**
 * Fetch the latest SpaceX launch.
 */
export async function fetchLatestLaunch() {
  const res = await axios.get(`${BASE}/launches/latest`, { timeout: TIMEOUT });
  return res.data;
}

/**
 * Fetch upcoming SpaceX launches.
 */
export async function fetchUpcomingLaunches() {
  const res = await axios.get(`${BASE}/launches/upcoming`, { timeout: TIMEOUT });
  return Array.isArray(res.data) ? res.data : [];
}

/**
 * Fetch past launches (paginated, most recent first). Returns up to 20.
 */
export async function fetchRecentLaunches(limit = 20) {
  const res = await axios.post(
    `${BASE}/launches/query`,
    {
      query: { upcoming: false },
      options: {
        sort: { date_utc: 'desc' },
        limit,
        populate: ['rocket'],
      },
    },
    { timeout: TIMEOUT }
  );
  return res.data?.docs || [];
}

/**
 * Fetch all SpaceX rockets.
 */
export async function fetchRockets() {
  const res = await axios.get(`${BASE}/rockets`, { timeout: TIMEOUT });
  return Array.isArray(res.data) ? res.data : [];
}
