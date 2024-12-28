// config/envConfig.js

/**
 * Environment configuration
 * Centralizes all environment-specific settings
 */
const dotenv = require('dotenv');
dotenv.config();

const environment = {
  // Core settings
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  BACKEND_URL: process.env.BACKEND_URL,
  
  // Frontend URLs
  FRONTEND_URLS: {
    production: process.env.FRONTEND_PROD_URL,
    development: process.env.FRONTEND_DEV_URL
  },

  // Environment helpers
  isProduction: function() {
    return this.NODE_ENV === 'production';
  },
  
  getCurrentFrontendUrl: function() {
    return this.isProduction() 
      ? this.FRONTEND_URLS.production 
      : this.FRONTEND_URLS.development;
  }
};

module.exports = environment;