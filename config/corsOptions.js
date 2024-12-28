// config/corsOptions.js

const environment = require('./envConfig');  

const whitelist = [
  environment.FRONTEND_URLS.production,
  environment.FRONTEND_URLS.development,
  environment.BACKEND_URL,
  'https://btvaultsapp-s72t.vercel.app'  // Add the specific origin that's being blocked
].filter(Boolean);  

const corsConfig = {
  origin: true, // Allow all origins temporarily to debug
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};  

module.exports = corsConfig;