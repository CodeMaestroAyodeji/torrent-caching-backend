// config/corsOptions.js  
const allowedOrigins = {  
  production: ['https://btvaultsapp-s72t.vercel.app'],  
  development: ['http://localhost:5173'],  
};  

const corsOptions = {  
  origin: (origin, callback) => {  
    const origins = allowedOrigins[process.env.NODE_ENV || 'development'];  
    // Allow requests with no origin (like mobile apps or curl requests)  
    if (!origin || origins.includes(origin)) {  
      callback(null, true); // Allow the origin  
    } else {  
      callback(new Error('Not allowed by CORS'));
    }  
  },  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],  
  credentials: true, // Allow credentials (like cookies) to be sent  
};  

module.exports = corsOptions;