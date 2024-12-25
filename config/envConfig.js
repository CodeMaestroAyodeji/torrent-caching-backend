// config/envConfig.js

const frontendUrl = process.env.NODE_ENV === 'production'
  ? 'https://btvaultsapp.vercel.app'
  : 'http://localhost:5173';

module.exports = frontendUrl;
