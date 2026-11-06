/**
 * helpers.js — Shared utility functions for backend services.
 */

/**
 * Strip dangerous HTML tags and trim whitespace from a string.
 * Only allows safe plain text through.
 */
export function sanitizeText(str) {
  if (!str) return '';
  // Remove all HTML tags
  return String(str)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Safely parse a date string and return a Date object or null.
 */
export function safeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Format a Date object as a MySQL-compatible DATETIME string.
 */
export function toMySQLDateTime(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Truncate a string to a maximum byte length (for MySQL TEXT fields).
 */
export function truncate(str, maxLen = 65535) {
  if (!str) return str;
  const buf = Buffer.from(str, 'utf8');
  if (buf.length <= maxLen) return str;
  return buf.slice(0, maxLen).toString('utf8');
}
