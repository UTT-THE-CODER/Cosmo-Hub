/**
 * newsNormalizer.js — Converts raw API responses into a unified news article format.
 *
 * Unified shape:
 * {
 *   title: string,
 *   description: string,
 *   content: string | null,
 *   image_url: string | null,
 *   source: string,
 *   category: string,
 *   original_url: string,
 *   published_at: Date | null,
 *   metadata: object | null,
 * }
 */

import { sanitizeText, safeDate } from './utils/helpers.js';

function numberOrNull(value) {
  return value !== undefined && value !== null && value !== '' && Number.isFinite(Number(value))
    ? Number(value)
    : null;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isPlaceholderTitle(value) {
  const title = value.trim();
  return /^(unknown|untitled|no title|n\/?a|none|null|news|space news)(?:[\s:—-]|$)/i.test(title)
    || /^(isro\s+(?:spacecraft|launch vehicle)|spacex\s+launch|exoplanet discovery|nasa\s+donki)\s*:/i.test(title);
}

const PLACEHOLDER_DESCRIPTIONS = new Set([
  'an isro launch vehicle',
  'an isro spacecraft mission',
  'no description available',
  'description unavailable',
  'no summary available',
]);

export function isValidNewsArticle(article) {
  const title = typeof article?.title === 'string' ? article.title.trim() : '';
  const description = typeof article?.description === 'string' ? article.description.trim() : '';
  const content = typeof article?.content === 'string' ? article.content.trim() : '';
  const source = typeof article?.source === 'string' ? article.source.trim() : '';
  const isNEO = article?.metadata?.type === 'near_earth_object';
  const hasMeaningfulText = [description, content].some(
    text => text.length >= 8 && !PLACEHOLDER_DESCRIPTIONS.has(text.toLowerCase().replace(/[.!?]+$/, ''))
  );
  const neoName = typeof article?.metadata?.name === 'string' ? article.metadata.name.trim() : '';
  const hasNEORecord = isNEO && Boolean(
    neoName.length >= 3
    && !isPlaceholderTitle(neoName)
    && (article.metadata?.objectId || article.metadata?.closeApproach?.epochDateCloseApproach)
  );
  const hasContent = isNEO ? hasNEORecord : hasMeaningfulText;

  return title.length >= 5
    && !isPlaceholderTitle(title)
    && source.length >= 2
    && !isPlaceholderTitle(source)
    && isHttpUrl(article?.original_url)
    && hasContent;
}

/**
 * Normalize an arXiv RSS entry.
 */
export function normalizeArxiv(item) {
  const authors = item.author
    ? String(item.author).split(/\s*,\s*/).filter(Boolean)
    : item.creator
      ? [String(item.creator)]
      : [];
  return {
    title: sanitizeText(item.title),
    description: sanitizeText(item.contentSnippet || item.content || ''),
    content: sanitizeText(item.content || null),
    image_url: null,
    source: 'arXiv',
    category: 'Astronomy',
    original_url: item.link || item.id || '',
    published_at: safeDate(item.pubDate || item.isoDate),
    metadata: {
      type: 'research_abstract',
      contentType: 'abstract',
      authors,
      categories: Array.isArray(item.categories) ? item.categories : [],
      referenceUrl: item.link || item.id || null,
    },
  };
}

/**
 * Normalize an ESA RSS entry.
 */
export function normalizeESA(item) {
  // ESA items have enclosure or media images sometimes
  const imageUrl =
    item.enclosure?.url ||
    item['media:content']?.url ||
    null;

  return {
    title: sanitizeText(item.title),
    description: sanitizeText(item.contentSnippet || item.summary || ''),
    content: sanitizeText(item.content || null),
    image_url: imageUrl,
    source: 'ESA',
    category: 'ESA',
    original_url: item.link || '',
    published_at: safeDate(item.pubDate || item.isoDate),
    metadata: {
      type: 'publisher_feed',
      contentType: 'feed_excerpt',
      authors: item.creator ? [String(item.creator)] : [],
      categories: Array.isArray(item.categories) ? item.categories : [],
      referenceUrl: item.link || null,
    },
  };
}

/**
 * Normalize NASA APOD into a news article.
 */
export function normalizeAPOD(apod) {
  const dateId = typeof apod.date === 'string'
    ? apod.date.slice(2).replaceAll('-', '')
    : '';
  return {
    title: sanitizeText(apod.title),
    description: sanitizeText(apod.explanation),
    content: sanitizeText(apod.explanation),
    image_url: apod.media_type === 'image' ? apod.url || null : null,
    source: 'NASA',
    category: 'NASA',
    original_url: dateId ? `https://apod.nasa.gov/apod/ap${dateId}.html` : '',
    published_at: safeDate(apod.date),
    metadata: {
      type: 'nasa_apod',
      contentType: 'explanation',
      mediaType: apod.media_type || null,
      copyright: apod.copyright || null,
    },
  };
}

/**
 * Normalize NASA DONKI (space weather) event.
 */
export function normalizeDONKI(event, eventType) {
  const eventTime = event.beginTime || event.startTime || event.eventTime || '';
  const analysis = event.cmeAnalyses?.find(item => item.isMostAccurate) || event.cmeAnalyses?.[0] || null;
  const title = event.title || event.name || [
    eventType,
    event.classType || analysis?.type,
    eventTime,
  ].filter(Boolean).join(' — ');
  const description = event.note || '';

  return {
    title: sanitizeText(title),
    description: sanitizeText(description),
    content: null,
    image_url: null,
    source: 'NASA',
    category: 'NASA',
    original_url: event.link || '',
    published_at: safeDate(event.beginTime || event.startTime || event.eventTime),
    metadata: {
      type: 'nasa_space_weather',
      contentType: 'event_record',
      eventType,
      eventId: event.flrID || event.cmeID || event.activityID || null,
      beginTime: eventTime || null,
      peakTime: event.peakTime || null,
      classType: event.classType || null,
      sourceLocation: event.sourceLocation || null,
      activeRegionNumber: event.activeRegionNum || null,
      cmeType: analysis?.type || null,
      cmeSpeedKmPerSecond: numberOrNull(analysis?.speed),
      cmeHalfAngleDegrees: numberOrNull(analysis?.halfAngle),
      referenceUrl: event.link || null,
    },
  };
}

/**
 * Normalize a NeoWs Near Earth Object into a news blurb.
 */
export function normalizeNEO(neo) {
  const approaches = Array.isArray(neo.close_approach_data) ? neo.close_approach_data : [];
  const earthApproaches = approaches.filter(approach => approach.orbiting_body === 'Earth');
  const datedApproaches = (earthApproaches.length ? earthApproaches : approaches)
    .filter(approach => approach.epoch_date_close_approach != null
      && Number.isFinite(Number(approach.epoch_date_close_approach)))
    .sort((a, b) => Number(a.epoch_date_close_approach) - Number(b.epoch_date_close_approach));
  const upcomingApproaches = datedApproaches.filter(
    approach => Number(approach.epoch_date_close_approach) >= Date.now()
  );
  const approach = upcomingApproaches[0]
    || datedApproaches[datedApproaches.length - 1]
    || approaches[0]
    || null;
  const dist = numberOrNull(approach?.miss_distance?.kilometers);
  const diameter = neo.estimated_diameter?.kilometers;
  const epochDateCloseApproach = numberOrNull(approach?.epoch_date_close_approach);
  const identifier = neo.designation || neo.name || neo.neo_reference_id || neo.id || null;

  return {
    title: sanitizeText(`Near-Earth Asteroid: ${neo.name || identifier || 'Unidentified object'}`),
    description: sanitizeText(
      `NASA's Near-Earth Object program tracks ${neo.name || identifier || 'this object'} and records its close approaches to Earth.`
    ),
    content: null,
    image_url: null,
    source: 'NASA',
    category: 'NASA',
    original_url: neo.nasa_jpl_url || 'https://cneos.jpl.nasa.gov/',
    published_at: epochDateCloseApproach === null ? null : new Date(epochDateCloseApproach),
    metadata: {
      type: 'near_earth_object',
      contentType: 'event_record',
      name: neo.name || identifier,
      designation: neo.designation || null,
      objectId: neo.neo_reference_id || neo.id || null,
      reportedCloseApproachCount: approaches.length,
      isSentryObject: typeof neo.is_sentry_object === 'boolean' ? neo.is_sentry_object : null,
      isPotentiallyHazardous: typeof neo.is_potentially_hazardous_asteroid === 'boolean'
        ? neo.is_potentially_hazardous_asteroid
        : null,
      absoluteMagnitudeH: numberOrNull(neo.absolute_magnitude_h),
      estimatedDiameterKm: {
        min: numberOrNull(diameter?.estimated_diameter_min),
        max: numberOrNull(diameter?.estimated_diameter_max),
      },
      closeApproach: approach ? {
        date: approach.close_approach_date || null,
        dateFull: approach.close_approach_date_full || null,
        epochDateCloseApproach,
        orbitingBody: approach.orbiting_body || null,
        missDistanceKm: numberOrNull(approach.miss_distance?.kilometers),
        missDistanceLunar: numberOrNull(approach.miss_distance?.lunar),
        missDistanceAu: numberOrNull(approach.miss_distance?.astronomical),
        velocityKmPerSecond: numberOrNull(approach.relative_velocity?.kilometers_per_second),
        velocityKmPerHour: numberOrNull(approach.relative_velocity?.kilometers_per_hour),
      } : null,
      referenceUrl: neo.nasa_jpl_url || null,
    },
  };
}

/**
 * Normalize a SpaceX launch.
 */
export function normalizeSpaceXLaunch(launch, rockets = []) {
  const rocket = rockets.find(r => r.id === launch.rocket)
    || (typeof launch.rocket === 'object' ? launch.rocket : null);
  return {
    title: sanitizeText(launch.name),
    description: sanitizeText(launch.details || ''),
    content: null,
    image_url: launch.links?.patch?.small || launch.links?.patch?.large || null,
    source: 'SpaceX',
    category: 'SpaceX',
    original_url:
      launch.links?.webcast ||
      launch.links?.wikipedia ||
      launch.links?.article ||
      `https://api.spacexdata.com/v4/launches/${encodeURIComponent(launch.id)}`,
    published_at: safeDate(launch.date_utc),
    metadata: {
      type: 'space_launch',
      contentType: 'launch_record',
      name: launch.name || null,
      flightNumber: launch.flight_number ?? null,
      launchDate: launch.date_utc || null,
      upcoming: Boolean(launch.upcoming),
      success: typeof launch.success === 'boolean' ? launch.success : null,
      rocket: rocket?.name || launch.rocket_name || null,
      details: launch.details || null,
      referenceUrl: launch.links?.article || null,
    },
  };
}

/**
 * Normalize an official ISRO press release without manufacturing missing fields.
 */
export function normalizeISROPressRelease(item) {
  return {
    title: sanitizeText(item.title),
    description: sanitizeText(item.description),
    content: sanitizeText(item.content || null),
    image_url: item.imageUrl || null,
    source: 'ISRO',
    category: 'ISRO',
    original_url: item.url || '',
    published_at: safeDate(item.publishedAt),
    metadata: {
      type: 'publisher_feed',
      contentType: 'feed_excerpt',
      referenceUrl: item.url || null,
    },
  };
}

/**
 * Normalize an exoplanet archive record for its existing data-driven section.
 */
export function normalizeExoplanet(planet) {
  const details = [
    planet.hostname ? `Host star: ${planet.hostname}` : null,
    planet.disc_year ? `Discovered: ${planet.disc_year}` : null,
    planet.pl_rade ? `Radius: ${Number(planet.pl_rade).toFixed(2)} R⊕` : null,
    planet.pl_bmasse ? `Mass: ${Number(planet.pl_bmasse).toFixed(2)} M⊕` : null,
    planet.pl_orbper ? `Orbital period: ${Number(planet.pl_orbper).toFixed(2)} days` : null,
  ]
    .filter(Boolean)
    .join(' | ');

  const referenceUrl = planet.pl_name
    ? `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(planet.pl_name)}`
    : '';
  return {
    title: sanitizeText(planet.pl_name || ''),
    description: sanitizeText(
      planet.pl_name
        ? `${planet.pl_name} is a confirmed exoplanet${planet.hostname ? ` orbiting ${planet.hostname}` : ''}.` +
          (details ? ` ${details}.` : '')
        : ''
    ),
    content: null,
    image_url: null,
    source: 'NASA Exoplanet Archive',
    category: 'Exoplanets',
    original_url: referenceUrl,
    published_at: planet.disc_year ? safeDate(`${planet.disc_year}-01-01`) : null,
    metadata: {
      type: 'exoplanet_record',
      contentType: 'archive_data',
      name: planet.pl_name || null,
      hostStar: planet.hostname || null,
      discoveryYear: planet.disc_year || null,
      radiusEarth: numberOrNull(planet.pl_rade),
      massEarth: numberOrNull(planet.pl_bmasse),
      orbitalPeriodDays: numberOrNull(planet.pl_orbper),
      distanceParsecs: numberOrNull(planet.sy_dist),
      referenceUrl: referenceUrl || null,
    },
  };
}
