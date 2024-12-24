// routes/torrent.js

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { broadcastTorrentProgress } = require('../websocket/websocketServer');
const Torrent = require('../models/Torrent');
const { startDownload, pauseDownload, resumeDownload, deleteDownload, cancelDownload } = require('../controllers/downloadController');
const torrentController = require('../controllers/torrentController');
const { getFiles } = require('../controllers/fileController');
const uploadMiddleware = require('../middleware/uploadTorrent');


const router = express.Router();

// Routes
router.get('/search', protect, torrentController.searchTorrents);
router.post('/add-magnet', protect, torrentController.addMagnetLink);
router.post('/upload', protect, uploadMiddleware, torrentController.uploadTorrentFile);

router.post('/start/:torrentId', protect, startDownload);
router.post('/pause/:torrentId', protect, pauseDownload);
router.post('/resume/:torrentId', protect, resumeDownload);
router.post('/cancel/:torrentId', protect, cancelDownload);
router.delete('/:torrentId', protect, deleteDownload);

router.get('/', protect, getFiles);


module.exports = router;