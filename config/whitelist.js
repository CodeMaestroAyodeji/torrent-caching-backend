// Manage allowed origins
const environment = require('./envConfig');

const whitelist = [
  'https://btvaultsapp-s72t.vercel.app',
  'http://localhost:5173',
  'https://torrent-caching-backend.vercel.app',
  environment.FRONTEND_URLS.production,
  environment.FRONTEND_URLS.development,
  environment.BACKEND_URL
  
].filter(Boolean);

module.exports = whitelist;