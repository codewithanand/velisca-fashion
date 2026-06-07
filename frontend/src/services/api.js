import config from '../config';

const API_URL = config.apiUrl;

let accessToken = localStorage.getItem('access_token') || null;
let refreshToken = localStorage.getItem('refresh_token') || null;
let isRefreshing = false;
let failedQueue = [];

export function setAccessToken(token) {
  accessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshToken(token) {
  refreshToken = token;
  if (token) {
    localStorage.setItem('refresh_token', token);
  } else {
    localStorage.removeItem('refresh_token');
  }
}

export function getRefreshToken() {
  return refreshToken;
}

export function clearAuth() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
}

function redirectToLogin() {
  const isAdminPath = window.location.pathname.startsWith('/admin');
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('access_token');
  if (!isAdminPath) {
    localStorage.removeItem('user');
  }
  window.location.href = isAdminPath ? '/admin/login' : '/login';
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
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearAuth();
    throw new ApiError(
      (await response.json().catch(() => null))?.message || 'Refresh token expired',
      response.status,
      null
    );
  }

  const data = await response.json();
  accessToken = data.data.access_token;
  setRefreshToken(data.data.refresh_token);
  return accessToken;
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const isLogin = endpoint === '/auth/login' || endpoint === '/admin/login';
  const isRefresh = endpoint === '/auth/refresh';

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Always send token if we have one
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new ApiError('Network error', 0, null);
  }

  // Login/refresh endpoints — never redirect, just pass through errors
  if (isLogin || isRefresh) {
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

  // Handle 401 for other endpoints — try refresh
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
  delete: (endpoint) =>
    request(endpoint, { method: 'DELETE' }),
};

export { ApiError };
export default api;
