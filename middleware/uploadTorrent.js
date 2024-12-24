// middleware/uploadTorrent.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadDir = path.join(__dirname, '../storage/torrents/');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    } catch (error) {
      cb(new Error('Failed to create upload directory'));
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

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
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('torrentFile'); // Move single() here

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
