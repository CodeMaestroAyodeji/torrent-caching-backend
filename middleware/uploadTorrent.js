// middleware/uploadTorrent.js

const multer = require('multer');

const fileFilter = (req, file, cb) => {
  // Check both mimetype and file extension
  const isTorrent = file.mimetype === 'application/x-bittorrent' || 
                   file.originalname.toLowerCase().endsWith('.torrent');
  if (isTorrent) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only .torrent files are allowed.'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage instead of disk
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('torrentFile');

// Create error handling middleware
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        error: true,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        error: true,
        message: err.message
      });
    }
    next();
  });
};

module.exports = uploadMiddleware;
