import config from '../config';

const API_URL = config.apiUrl;

const EXPIRY_MARGIN_SEC = 60;
const MAX_REFRESH_RETRIES = 2;

function loadFromStorage(key, fallback = null) {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}
function saveToStorage(key, value) {
  try { if (value) localStorage.setItem(key, value); else localStorage.removeItem(key); } catch {}
}

let accessToken = loadFromStorage('access_token');
let refreshToken = loadFromStorage('refresh_token');
let tokenExpiresAt = parseInt(loadFromStorage('token_expires_at', '0'), 10);
let isRefreshing = false;
let failedQueue = [];
let refreshRetryCount = 0;

export function setAccessToken(token) {
  accessToken = token;
  saveToStorage('access_token', token);
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshToken(token) {
  refreshToken = token;
  saveToStorage('refresh_token', token);
}

export function getRefreshToken() {
  return refreshToken;
}

export function setTokenExpiry(expiresIn) {
  tokenExpiresAt = Date.now() + expiresIn * 1000;
  saveToStorage('token_expires_at', String(tokenExpiresAt));
}

export function clearAuth() {
  accessToken = null;
  refreshToken = null;
  tokenExpiresAt = 0;
  saveToStorage('access_token', null);
  saveToStorage('refresh_token', null);
  saveToStorage('token_expires_at', null);
  saveToStorage('user', null);
}

function clearUser() {
  saveToStorage('user', null);
}

function redirectToLogin() {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  accessToken = null;
  refreshToken = null;
  tokenExpiresAt = 0;
  saveToStorage('access_token', null);
  saveToStorage('refresh_token', null);
  saveToStorage('token_expires_at', null);
  saveToStorage('admin', null);
  if (!isAdminPath) clearUser();
  window.location.href = isAdminPath ? '/admin/login' : '/login';
}

function isTokenExpired() {
  if (!accessToken || !tokenExpiresAt) return false;
  return Date.now() >= tokenExpiresAt - EXPIRY_MARGIN_SEC * 1000;
}

function isTokenAboutToExpire() {
  if (!accessToken || !tokenExpiresAt) return false;
  return Date.now() >= tokenExpiresAt - 300 * 1000;
}

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function onRefreshed(token) {
  failedQueue.forEach(({ resolve }) => resolve(token));
  failedQueue = [];
}

function onRefreshError(error) {
  failedQueue.forEach(({ reject }) => reject(error));
  failedQueue = [];
}

async function refreshAccessToken() {
  const currentRefreshToken = refreshToken;
  if (!currentRefreshToken) {
    throw new ApiError('No refresh token available', 401, null);
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ refresh_token: currentRefreshToken }),
  });

  if (!response.ok) {
    throw new ApiError(
      (await response.json().catch(() => null))?.message || 'Refresh token expired',
      response.status,
      null
    );
  }

  const data = await response.json();
  accessToken = data.data.access_token;
  setRefreshToken(data.data.refresh_token);
  if (data.data.expires_in) {
    setTokenExpiry(data.data.expires_in);
  }
  refreshRetryCount = 0;
  return accessToken;
}

function shouldSkipAuth(endpoint) {
  return endpoint === '/auth/login' ||
         endpoint === '/admin/login' ||
         endpoint === '/auth/register' ||
         endpoint === '/auth/refresh' ||
         endpoint === '/auth/forgot-password' ||
         endpoint === '/auth/reset-password';
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const skipAuth = shouldSkipAuth(endpoint);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  if (accessToken && !skipAuth) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError('Network error', 0, null);
  }

  if (skipAuth) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(
        errorData?.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }
    return response.json();
  }

  if (response.status === 401 && !options._retry) {
    if (!refreshToken) {
      redirectToLogin();
      throw new ApiError('Unauthorized', 401, null);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            headers['Authorization'] = `Bearer ${token}`;
            resolve(
              fetch(url, { ...options, headers, _retry: true }).then(async (res) => {
                if (!res.ok) {
                  const errData = await res.json().catch(() => null);
                  throw new ApiError(
                    errData?.message || `Request failed with status ${res.status}`,
                    res.status,
                    errData
                  );
                }
                return res.json();
              })
            );
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      onRefreshed(newToken);
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, { ...options, headers, _retry: true });
    } catch (error) {
      onRefreshError(error);
      if (refreshRetryCount < MAX_REFRESH_RETRIES) {
        refreshRetryCount++;
        isRefreshing = false;
        const backoff = 1000 * Math.pow(2, refreshRetryCount);
        await new Promise((r) => setTimeout(r, backoff));
        return request(endpoint, options);
      }
      redirectToLogin();
      throw error;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      errorData?.message || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function ensureFreshToken() {
  if (!accessToken || !refreshToken) return null;
  if (!isTokenExpired()) return accessToken;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const newToken = await refreshAccessToken();
    onRefreshed(newToken);
    return newToken;
  } catch (error) {
    onRefreshError(error);
    if (refreshRetryCount < MAX_REFRESH_RETRIES) {
      refreshRetryCount++;
      isRefreshing = false;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, refreshRetryCount)));
      return ensureFreshToken();
    }
    clearAuth();
    throw error;
  } finally {
    isRefreshing = false;
  }
}

export const api = {
  get: (endpoint, params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`${endpoint}${query}`, { method: 'GET' });
  },
  post: (endpoint, data) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) =>
    request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (endpoint, data) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint, params) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`${endpoint}${query}`, { method: 'DELETE' });
  },
};

export { ApiError };
export default api;
