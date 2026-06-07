const config = {
  appName: import.meta.env.VITE_APP_NAME || 'Velisca',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  env: import.meta.env.VITE_APP_ENV || 'development',
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  isDev: import.meta.env.VITE_APP_ENV === 'development' || !import.meta.env.VITE_APP_ENV,
  isProd: import.meta.env.VITE_APP_ENV === 'production',
};

export default config;
