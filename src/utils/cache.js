import AsyncStorage from '@react-native-async-storage/async-storage';
const PREFIX = 'api-cache:';
const INDEX_KEY = `${PREFIX}index`;
const MAX_ENTRIES = 40;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const buildCacheKey = (endpoint, params = {}) => {
  const query = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${PREFIX}${endpoint}?${query}`;
};

export const getCached = async key => {
  try {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const entry = JSON.parse(raw);

    if (Date.now() - entry.savedAt > MAX_AGE_MS) {
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
};
let writeQueue = Promise.resolve();

export const setCached = (key, data) => {
  writeQueue = writeQueue
    .then(async () => {
      await AsyncStorage.setItem(
        key,
        JSON.stringify({ savedAt: Date.now(), data }),
      );

      const rawIndex = await AsyncStorage.getItem(INDEX_KEY);
      const index = (rawIndex ? JSON.parse(rawIndex) : []).filter(
        item => item !== key,
      );
      index.push(key);
      while (index.length > MAX_ENTRIES) {
        const oldest = index.shift();
        await AsyncStorage.removeItem(oldest);
      }
      await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(index));
    })
    .catch(() => {});

  return writeQueue;
};

export const clearApiCache = async () => {
  try {
    const rawIndex = await AsyncStorage.getItem(INDEX_KEY);
    const index = rawIndex ? JSON.parse(rawIndex) : [];

    await AsyncStorage.multiRemove([...index, INDEX_KEY]);
  } catch {
  }
};