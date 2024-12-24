// config/corsOptions.js

const allowedOrigins = {
  development: ['http://localhost:5173'],
  production: ['https://btvaultsapp.vercel.app']
};

const corsOptions = {
  origin: (origin, callback) => {
    const origins = allowedOrigins[process.env.NODE_ENV || 'development'];
    if (!origin || origins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

module.exports = corsOptions;
