const STORAGE_KEYS = {
  favoriteQuotes: 'cosmos_favorite_quotes',
  savedPlanets: 'cosmos_saved_planets',
  customLines: 'cosmos_custom_lines',
  favoriteEmojis: 'cosmos_favorite_emojis',
  myMood: 'cosmos_mood',
};

function safeParse(defaultValue, key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write issues gracefully in frontend-only mode.
  }
}

export const storageService = {
  getFavoriteQuotes() {
    return safeParse([], STORAGE_KEYS.favoriteQuotes);
  },
  setFavoriteQuotes(value) {
    safeSet(STORAGE_KEYS.favoriteQuotes, value);
  },

  getSavedPlanets() {
    return safeParse([], STORAGE_KEYS.savedPlanets);
  },
  setSavedPlanets(value) {
    safeSet(STORAGE_KEYS.savedPlanets, value);
  },

  getCustomLines() {
    return safeParse([], STORAGE_KEYS.customLines);
  },
  setCustomLines(value) {
    safeSet(STORAGE_KEYS.customLines, value);
  },

  getFavoriteEmojis() {
    return safeParse(['🚀', '🌙', '🪐'], STORAGE_KEYS.favoriteEmojis);
  },
  setFavoriteEmojis(value) {
    safeSet(STORAGE_KEYS.favoriteEmojis, value);
  },

  getMood() {
    return safeParse('Curious', STORAGE_KEYS.myMood);
  },
  setMood(value) {
    safeSet(STORAGE_KEYS.myMood, value);
  },
};
