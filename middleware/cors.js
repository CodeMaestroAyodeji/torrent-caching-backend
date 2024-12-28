const cors = require('cors');
const corsOptions = require('../config/corsOptions');

const corsMiddleware = cors(corsOptions);

const handlePreflight = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    return res.status(200).send();
  }
  next();
};

module.exports = { corsMiddleware, handlePreflight };