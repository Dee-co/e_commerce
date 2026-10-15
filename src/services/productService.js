const BASE_URL = 'https://dummyjson.com';
import axios from 'axios';
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
const request = async (endpoint, params = {}, signal) => {
  try {
    const response = await api.get(endpoint, {
      params,
      signal,
    });
    return response.data;
  } catch (error) {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      throw error;
    }
    const message = error.response
      ? `Request failed: ${error.response.status}`
      : error.message || 'Something went wrong';
    throw new Error(message);
  }
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
