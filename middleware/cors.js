// middleware/cors.js

const handlePreflight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
};

const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const corsOptions = require('../config/corsOptions');

  corsOptions.origin(origin, (error, allowed) => {
    if (error) {
      res.status(403).json({ message: 'CORS not allowed' });
      return;
    }

    if (allowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(','));
      res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
      res.setHeader('Access-Control-Allow-Credentials', corsOptions.credentials);
      res.setHeader('Access-Control-Max-Age', corsOptions.maxAge);
    }

    next();
  });
};

module.exports = { corsMiddleware, handlePreflight };