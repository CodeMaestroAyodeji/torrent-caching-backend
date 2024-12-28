// config/corsOptions.js

const environment = require('./envConfig');  

const whitelist = [  
  environment.FRONTEND_URLS.production,  // Production URL  
  environment.FRONTEND_URLS.development, // Development URL  
  environment.BACKEND_URL  // Ensure this is set in your .env file  
].filter(Boolean);  

const corsConfig = {  
  origin: function (origin, callback) {  
    if (!origin || whitelist.includes(origin)) {  
      return callback(null, true);  
    }  
    callback(new Error(`Origin ${origin} not allowed by CORS`));  
  },  
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