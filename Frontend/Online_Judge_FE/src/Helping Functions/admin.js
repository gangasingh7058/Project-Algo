import axios from 'axios';
import getusertoken from './getusertoken';

const BASE = `${import.meta.env.VITE_BACKEND_PORT}/admin`;

// Axios instance that always sends the signed-in user's token
export const adminApi = () =>
  axios.create({ baseURL: BASE, headers: { usertoken: getusertoken() || '' } });

// Cached per token, so the navbar doesn't refetch on every page
let cache = { token: undefined, promise: null };

export const checkAdmin = () => {
  const token = getusertoken();
  if (!token) return Promise.resolve(false);
  if (cache.token !== token) {
    cache = {
      token,
      promise: adminApi()
        .get('/me')
        .then((r) => !!r.data.isAdmin)
        .catch(() => false),
    };
  }
  return cache.promise;
};

export const apiError = (error, fallback = 'Something went wrong') =>
  error.response?.data?.msg || error.response?.data?.error || error.message || fallback;

// Analytics are kept for the browser session so revisiting the page doesn't re-query
const STATS_KEY = (days) => `admin-stats-${days}`;

export const getCachedStats = (days) => {
  try {
    const data = JSON.parse(sessionStorage.getItem(STATS_KEY(days)) || 'null');
    // Ignore anything saved from an older response shape
    return data?.generatedAt && data?.range ? data : null;
  } catch {
    return null;
  }
};

export const saveStats = (days, data) => {
  try {
    sessionStorage.setItem(STATS_KEY(days), JSON.stringify(data));
  } catch {
    /* storage unavailable — analytics still render, just not remembered */
  }
};
