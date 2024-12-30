// config/corsOptions.js

const environment = require('./envConfig');  

const corsOptions = {  
  origin: environment.isProduction() ? environment.FRONTEND_URLS.production : '*', // Allow all origins in development  
  credentials: true,  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],  
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],  
  exposedHeaders: ['Content-Length', 'Content-Type'],  
  maxAge: 86400,  
  preflightContinue: false,  
  optionsSuccessStatus: 200 // Some legacy browsers (IE11) choke on 204  
};  

module.exports = corsOptions;
