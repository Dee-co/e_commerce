import axios from 'axios';
import { isDeviceOffline } from '../utils/network';
import { buildCacheKey, getCached, setCached } from '../utils/cache';
const BASE_URL = 'https://dummyjson.com';
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 600;
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const createCanceledError = () => {
  const error = new Error('Request canceled');
  error.name = 'AbortError';
  error.code = 'ERR_CANCELED';
  return error;
};

export const isRequestCanceled = error =>
  axios.isCancel(error) ||
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'AbortError';
const isRetryable = error => !error.response || error.response.status >= 500;
const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createCanceledError());
      return;
    }

    let timer;
    const onAbort = () => {
      clearTimeout(timer);
      reject(createCanceledError());
    };

    timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    signal?.addEventListener('abort', onAbort);
  });

const toAppError = error => {
  const appError = new Error(
    error.response
      ? `Request failed: ${error.response.status}`
      : error.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : 'No internet connection',
  );

  appError.isNetworkError = !error.response;
  appError.status = error.response?.status;

  return appError;
};
const withCacheFlag = data =>
  Array.isArray(data) ? data : { ...data, fromCache: true };

const request = async (endpoint, params = {}, signal) => {
  const cacheKey = buildCacheKey(endpoint, params);
  let lastError;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await api.get(endpoint, { params, signal });
      setCached(cacheKey, response.data);

      return response.data;
    } catch (error) {
      if (isRequestCanceled(error)) {
        throw error;
      }

      lastError = error;
      const shouldStop =
        !isRetryable(error) ||
        attempt === MAX_RETRIES ||
        (!error.response && (await isDeviceOffline()));

      if (shouldStop) {
        break;
      }

      await wait(RETRY_BASE_DELAY_MS * 2 ** attempt, signal);
    }
  }
  if (isRetryable(lastError)) {
    const cached = await getCached(cacheKey);

    if (cached) {
      return withCacheFlag(cached);
    }
  }

  throw toAppError(lastError);
};

export const getProducts = ({ limit = 10, skip = 0, sort, signal } = {}) =>
  request(
    '/products',
    {
      limit,
      skip,
      ...sort,
    },
    signal,
  );

export const getCategories = signal =>
  request('/products/categories', {}, signal);

export const searchProducts = (
  query,
  { limit = 10, skip = 0, sort, signal } = {},
) =>
  request(
    '/products/search',
    {
      q: query,
      limit,
      skip,
      ...sort,
    },
    signal,
  );

export const getProductById = (id, signal) => {
  if (id === undefined || id === null || String(id).trim() === '') {
    return Promise.reject(new Error('Product ID is required'));
  }

  return request(`/products/${encodeURIComponent(id)}`, {}, signal);
};

export const getProductsByCategory = (
  category,
  { limit = 10, skip = 0, sort, signal } = {},
) =>
  request(
    `/products/category/${encodeURIComponent(category)}`,
    {
      limit,
      skip,
      ...sort,
    },
    signal,
  );