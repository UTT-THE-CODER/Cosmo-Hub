
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { CURATED_QUOTES } from './quoteSeeds.js';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'space_news',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

/**
 * Initialize database tables on startup.
 */
export async function initDB() {
  const conn = await pool.getConnection();
  try {
    // Create database if it doesn't exist
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'space_news'}\``);
    await conn.query(`USE \`${process.env.DB_NAME || 'space_news'}\``);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS news (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title         TEXT NOT NULL,
        description   TEXT,
        content       LONGTEXT,
        image_url     TEXT,
        source        VARCHAR(64) NOT NULL,
        category      VARCHAR(64) NOT NULL,
        original_url  VARCHAR(2083) NOT NULL,
        published_at  DATETIME,
        metadata      JSON,
        fetched_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        url_hash      VARCHAR(64) GENERATED ALWAYS AS (SHA1(original_url)) STORED,
        UNIQUE KEY uq_url_hash (url_hash),
        INDEX idx_category (category),
        INDEX idx_source (source),
        INDEX idx_published_at (published_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [metadataColumns] = await conn.query("SHOW COLUMNS FROM news LIKE 'metadata'");
    if (metadataColumns.length === 0) {
      await conn.query('ALTER TABLE news ADD COLUMN metadata JSON NULL');
    }

    // APOD table for NASA Astronomy Picture of the Day
    await conn.query(`
      CREATE TABLE IF NOT EXISTS apod (
        id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        date          DATE NOT NULL UNIQUE,
        title         VARCHAR(512),
        explanation   LONGTEXT,
        url           TEXT,
        hdurl         TEXT,
        media_type    VARCHAR(32),
        copyright     VARCHAR(256),
        fetched_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // SpaceX launches table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS launches (
        id            VARCHAR(64) PRIMARY KEY,
        name          VARCHAR(256),
        date_utc      DATETIME,
        success       TINYINT(1),
        upcoming      TINYINT(1) DEFAULT 0,
        details       TEXT,
        rocket_name   VARCHAR(128),
        patch_small   TEXT,
        patch_large   TEXT,
        webcast       TEXT,
        wikipedia     TEXT,
        article       TEXT,
        flight_number INT,
        fetched_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Exoplanets table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS exoplanets (
        pl_name       VARCHAR(128) PRIMARY KEY,
        hostname      VARCHAR(128),
        disc_year     SMALLINT,
        pl_rade       FLOAT COMMENT 'Planet radius in Earth radii',
        pl_bmasse     FLOAT COMMENT 'Planet mass in Earth masses',
        pl_orbper     FLOAT COMMENT 'Orbital period in days',
        sy_dist       FLOAT COMMENT 'Distance to system in pc',
        fetched_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS quotes (
        id          VARCHAR(96) PRIMARY KEY,
        quote_text  TEXT NOT NULL,
        author      VARCHAR(255) NOT NULL,
        category    VARCHAR(32) NOT NULL,
        source      VARCHAR(255) NOT NULL,
        source_url  TEXT NOT NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_quote_text_author (quote_text(180), author),
        INDEX idx_quote_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS quote_favorites (
        user_id     CHAR(36) NOT NULL,
        quote_id    VARCHAR(96) NOT NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, quote_id),
        INDEX idx_quote_favorite_quote (quote_id),
        CONSTRAINT fk_quote_favorite_quote
          FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await conn.query(
      `INSERT INTO quotes (id, quote_text, author, category, source, source_url)
       VALUES ${CURATED_QUOTES.map(() => '(?, ?, ?, ?, ?, ?)').join(', ')}
       ON DUPLICATE KEY UPDATE
         quote_text = VALUES(quote_text),
         author = VALUES(author),
         category = VALUES(category),
         source = VALUES(source),
         source_url = VALUES(source_url)`,
      CURATED_QUOTES.flatMap(quote => [
        quote.id,
        quote.text,
        quote.author,
        quote.category,
        quote.source,
        quote.sourceUrl,
      ])
    );

    console.log('[DB] Tables initialized.');
  } finally {
    conn.release();
  }
}

export default pool;
