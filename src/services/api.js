import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/env';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
let isRefreshing = false;
let refreshSubscribers = [];
const subscribeTokenRefresh = callback => {
  refreshSubscribers.push(callback);
};
const onTokenRefreshed = newAccessToken => {
  refreshSubscribers.forEach(callback => {
    callback(newAccessToken);
  });
  refreshSubscribers = [];
};
const refreshAccessToken = async () => {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error('REFRESH_TOKEN_NOT_FOUND');
  }
  const response = await refreshApi.post('/auth/refresh', {
    refreshToken,
  });
  console.log('REFRESH RESPONSE:', response?.data);
  const newAccessToken = response?.data?.data?.accessToken;
  if (!newAccessToken) {
    throw new Error('ACCESS_TOKEN_NOT_RECEIVED');
  }
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  return newAccessToken;
};
api.interceptors.request.use(
  async config => {
    const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  error => Promise.reject(error),
);
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error?.config;
    const status = error?.response?.status;
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/verify-otp',
      '/auth/resend-otp',
      '/auth/refresh',
      '/auth/logout',
    ];
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest = authEndpoints.some(endpoint =>
      requestUrl.includes(endpoint),
    );
    if (isAuthRequest) {
      return Promise.reject(error);
    }
    if (status !== 401) {
      return Promise.reject(error);
    }
    if (originalRequest?._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(newAccessToken => {
          if (!newAccessToken) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          resolve(api(originalRequest));
        });
      });
    }
    isRefreshing = true;
    try {
      const newAccessToken = await refreshAccessToken();
      isRefreshing = false;
      onTokenRefreshed(newAccessToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      console.log(
        'TOKEN REFRESH ERROR:',
        refreshError?.response?.data || refreshError?.message,
      );
      isRefreshing = false;
      refreshSubscribers = [];
      await AsyncStorage.multiRemove([
        ACCESS_TOKEN_KEY,
        REFRESH_TOKEN_KEY,
        USER_KEY,
      ]);

      return Promise.reject(refreshError);
    }
  },
);

export default api;
