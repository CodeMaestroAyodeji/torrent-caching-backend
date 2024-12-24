// config/envConfig.js

const frontendUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5173'
  : 'https://btvaultsapp.vercel.app';

module.exports = frontendUrl;
