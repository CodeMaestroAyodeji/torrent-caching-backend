const cors = require('cors');
const corsOptions = require('../config/corsOptions');

// Create middleware function
const corsMiddleware = cors(corsOptions);

// Handle preflight requests
const handlePreflight = (req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    return res.status(204).send();
  }
  next();
};

module.exports = { corsMiddleware, handlePreflight };