/**
 * newsStore.js — Database storage layer for all news articles.
 * Handles upserts (insert or update) to prevent duplicates using url_hash.
 */
import pool from './db.js';
import { isValidNewsArticle } from './newsNormalizer.js';
import { toMySQLDateTime, truncate } from './utils/helpers.js';

const NEWS_QUALITY_CONDITION = `
  title IS NOT NULL
  AND CHAR_LENGTH(TRIM(title)) >= 5
  AND LOWER(TRIM(title)) NOT REGEXP '^(unknown|untitled|no title|n/?a|none|null|news|space news)([[:space:][:punct:]]|$)'
  AND LOWER(TRIM(title)) NOT REGEXP '^(isro[[:space:]]+(spacecraft|launch vehicle)|spacex[[:space:]]+launch|exoplanet discovery|nasa[[:space:]]+donki)[[:space:]]*:'
  AND LOWER(TRIM(title)) NOT REGEXP '^near-earth asteroid:[[:space:]]*(unknown|unidentified object|untitled)([[:space:][:punct:]]|$)'
  AND source IS NOT NULL
  AND CHAR_LENGTH(TRIM(source)) >= 2
  AND LOWER(TRIM(source)) NOT REGEXP '^(unknown|untitled|n/?a|none|null)([[:space:][:punct:]]|$)'
  AND original_url IS NOT NULL AND LOWER(TRIM(original_url)) REGEXP '^https?://'
  AND (
    CHAR_LENGTH(TRIM(COALESCE(description, ''))) >= 8
    OR CHAR_LENGTH(TRIM(COALESCE(content, ''))) >= 8
  )
  AND LOWER(TRIM(COALESCE(description, ''))) NOT REGEXP '^(an isro launch vehicle|an isro spacecraft mission|no description available|description unavailable|no summary available)[.!?]*$'
  AND LOWER(TRIM(COALESCE(content, ''))) NOT REGEXP '^(an isro launch vehicle|an isro spacecraft mission|no description available|description unavailable|no summary available)[.!?]*$'
`;

/**
 * Upsert a single normalized article into the news table.
 * Uses INSERT ... ON DUPLICATE KEY UPDATE to handle existing URLs.
 * @param {object} article - normalized article from newsNormalizer.js
 */
export async function upsertArticle(article) {
  if (!isValidNewsArticle(article)) {
    throw new TypeError('Article failed news quality validation.');
  }

  const sql = `
    INSERT INTO news (title, description, content, image_url, source, category, original_url, published_at, metadata, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      title        = VALUES(title),
      description  = VALUES(description),
      content      = VALUES(content),
      image_url    = VALUES(image_url),
      published_at = VALUES(published_at),
      metadata     = VALUES(metadata),
      fetched_at   = NOW()
  `;

  const values = [
    truncate(article.title, 500),
    truncate(article.description, 2000),
    truncate(article.content, 65000),
    article.image_url ? truncate(article.image_url, 1000) : null,
    article.source,
    article.category,
    truncate(article.original_url, 2083),
    toMySQLDateTime(article.published_at),
    article.metadata ? JSON.stringify(article.metadata) : null,
  ];

  await pool.execute(sql, values);
}

/**
 * Bulk upsert an array of articles. Skips invalid entries.
 */
export async function upsertArticles(articles) {
  let inserted = 0;
  let rejected = 0;
  let failed = 0;

  for (const article of articles) {
    if (!isValidNewsArticle(article)) {
      rejected++;
      continue;
    }
    try {
      await upsertArticle(article);
      inserted++;
    } catch (err) {
      failed++;
      console.warn(`[newsStore] Upsert failed for "${article.title}":`, err.message);
    }
  }

  return { inserted, rejected, failed };
}

/**
 * Query paginated news articles with optional category/source/search filters.
 */
export async function queryNews({
  category = null,
  source = null,
  search = null,
  page = 1,
  limit = 20,
  sort = 'published_at',
  order = 'DESC',
} = {}) {
  const validSorts = ['published_at', 'fetched_at', 'title'];
  const validOrders = ['ASC', 'DESC'];
  const safeSort = validSorts.includes(sort) ? sort : 'published_at';
  const safeOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
  const offset = (Math.max(1, page) - 1) * limit;

  const conditions = [NEWS_QUALITY_CONDITION];
  const params = [];

  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }
  if (source) {
    conditions.push('source = ?');
    params.push(source);
  }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q);
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const [rows] = await pool.execute(
    `SELECT id, title, description, image_url, source, category, original_url, published_at, fetched_at
     FROM news
     ${whereClause}
     ORDER BY ${safeSort} ${safeOrder}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM news ${whereClause}`,
    params
  );

  return {
    articles: rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Fetch one news article, including source-provided text, by database ID.
 */
export async function getNewsArticle(id) {
  const [rows] = await pool.execute(
    `SELECT id, title, description, content, image_url, source, category, published_at, metadata
     FROM news
     WHERE id = ? AND ${NEWS_QUALITY_CONDITION}
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function updateNewsImageLookup(id, image) {
  await pool.execute(
    `UPDATE news
     SET image_url = COALESCE(image_url, ?),
         metadata = JSON_SET(
           COALESCE(metadata, JSON_OBJECT()),
           '$.imageLookupAt', ?,
           '$.imageAttribution', CAST(? AS JSON)
         )
     WHERE id = ?`,
    [
      image?.imageUrl || null,
      new Date().toISOString(),
      JSON.stringify(image?.attribution || null),
      id,
    ]
  );
}

export async function getRelatedNEOArticles(id, limit = 3) {
  const [rows] = await pool.execute(
    `SELECT id, title, description, source, category, published_at
     FROM news
     WHERE id <> ?
       AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.type')) = 'near_earth_object'
       AND ${NEWS_QUALITY_CONDITION}
     ORDER BY published_at DESC
     LIMIT ?`,
    [id, limit]
  );
  return rows;
}

/**
 * Upsert NASA APOD record.
 */
export async function upsertAPOD(apod) {
  const sql = `
    INSERT INTO apod (date, title, explanation, url, hdurl, media_type, copyright, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      title       = VALUES(title),
      explanation = VALUES(explanation),
      url         = VALUES(url),
      hdurl       = VALUES(hdurl),
      media_type  = VALUES(media_type),
      copyright   = VALUES(copyright),
      fetched_at  = NOW()
  `;
  await pool.execute(sql, [
    apod.date,
    truncate(apod.title, 512),
    truncate(apod.explanation, 65000),
    apod.url,
    apod.hdurl || null,
    apod.media_type || 'image',
    apod.copyright || null,
  ]);
}

/**
 * Get the latest APOD from the database.
 */
export async function getLatestAPOD() {
  const [rows] = await pool.execute(
    'SELECT * FROM apod ORDER BY date DESC LIMIT 1'
  );
  return rows[0] || null;
}

/**
 * Upsert a SpaceX launch.
 */
export async function upsertLaunch(launch) {
  const sql = `
    INSERT INTO launches (id, name, date_utc, success, upcoming, details, rocket_name, patch_small, patch_large, webcast, wikipedia, article, flight_number, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      name         = VALUES(name),
      date_utc     = VALUES(date_utc),
      success      = VALUES(success),
      upcoming     = VALUES(upcoming),
      details      = VALUES(details),
      rocket_name  = VALUES(rocket_name),
      patch_small  = VALUES(patch_small),
      fetched_at   = NOW()
  `;
  await pool.execute(sql, [
    launch.id,
    truncate(launch.name, 256),
    toMySQLDateTime(launch.date_utc ? new Date(launch.date_utc) : null),
    launch.success != null ? (launch.success ? 1 : 0) : null,
    launch.upcoming ? 1 : 0,
    truncate(launch.details, 65000),
    truncate(launch.rocket_name || (launch.rocket?.name) || null, 128),
    launch.links?.patch?.small || null,
    launch.links?.patch?.large || null,
    launch.links?.webcast || null,
    launch.links?.wikipedia || null,
    launch.links?.article || null,
    launch.flight_number || null,
  ]);
}

/**
 * Get recent launches from the database.
 */
export async function getLaunches({ upcoming = false, limit = 20 } = {}) {
  const [rows] = await pool.execute(
    `SELECT * FROM launches WHERE upcoming = ? ORDER BY date_utc DESC LIMIT ?`,
    [upcoming ? 1 : 0, limit]
  );
  return rows;
}

/**
 * Upsert an exoplanet record.
 */
export async function upsertExoplanet(planet) {
  const sql = `
    INSERT INTO exoplanets (pl_name, hostname, disc_year, pl_rade, pl_bmasse, pl_orbper, sy_dist, fetched_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
      hostname   = VALUES(hostname),
      disc_year  = VALUES(disc_year),
      pl_rade    = VALUES(pl_rade),
      pl_bmasse  = VALUES(pl_bmasse),
      pl_orbper  = VALUES(pl_orbper),
      sy_dist    = VALUES(sy_dist),
      fetched_at = NOW()
  `;
  await pool.execute(sql, [
    planet.pl_name,
    planet.hostname || null,
    planet.disc_year || null,
    planet.pl_rade || null,
    planet.pl_bmasse || null,
    planet.pl_orbper || null,
    planet.sy_dist || null,
  ]);
}

/**
 * Get exoplanets from the database.
 */
export async function getExoplanets({ limit = 100, page = 1 } = {}) {
  const offset = (Math.max(1, page) - 1) * limit;
  const [rows] = await pool.execute(
    `SELECT * FROM exoplanets ORDER BY disc_year DESC, pl_name ASC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [[{ total }]] = await pool.execute('SELECT COUNT(*) AS total FROM exoplanets');
  return { planets: rows, total };
}
