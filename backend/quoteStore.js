import pool from './db.js';

export async function getQuotes(category = null) {
  const query = `
    SELECT id, quote_text AS text, author, category, source, source_url
    FROM quotes
    ${category ? 'WHERE category = ?' : ''}
    ORDER BY id
  `;
  const [rows] = await pool.execute(query, category ? [category] : []);
  return rows;
}

export async function getDailyQuote(date = new Date()) {
  const [countRows] = await pool.execute('SELECT COUNT(*) AS count FROM quotes');
  const count = Number(countRows[0]?.count || 0);
  if (!count) return null;

  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  const offset = ((day % count) + count) % count;
  const [rows] = await pool.execute(
    `SELECT id, quote_text AS text, author, category, source, source_url
     FROM quotes
     ORDER BY id
     LIMIT 1 OFFSET ?`,
    [offset]
  );
  return rows[0] || null;
}

export async function getQuoteFavorites(userId) {
  const [rows] = await pool.execute(
    `SELECT q.id, q.quote_text AS text, q.author, q.category, q.source, q.source_url
     FROM quote_favorites f
     JOIN quotes q ON q.id = f.quote_id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function addQuoteFavorite(userId, quoteId) {
  const [result] = await pool.execute(
    `INSERT IGNORE INTO quote_favorites (user_id, quote_id)
     SELECT ?, id FROM quotes WHERE id = ?`,
    [userId, quoteId]
  );
  return result.affectedRows > 0;
}

export async function removeQuoteFavorite(userId, quoteId) {
  const [result] = await pool.execute(
    'DELETE FROM quote_favorites WHERE user_id = ? AND quote_id = ?',
    [userId, quoteId]
  );
  return result.affectedRows > 0;
}
