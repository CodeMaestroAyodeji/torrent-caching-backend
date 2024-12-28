// Manage allowed origins
const environment = require('./envConfig');

const whitelist = [
  environment.FRONTEND_URLS.production,  // Production frontend
  environment.FRONTEND_URLS.development, // Development frontend
  environment.BACKEND_URL,              // Backend URL
  'https://torrent-caching-backend.vercel.app'
].filter(Boolean);

module.exports = whitelist;