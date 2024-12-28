const cors = require('cors');
const corsOptions = require('../config/corsOptions');

// Create middleware function
const corsMiddleware = cors(corsOptions);

// Handle preflight requests
const handlePreflight = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Apply CORS headers for preflight requests
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    return res.status(200).send();
  }
  next();
};

module.exports = { corsMiddleware, handlePreflight };