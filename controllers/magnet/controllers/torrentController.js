const torrentStream = require('torrent-stream');
const TorrentModel = require('../../../models/Torrent');
const User = require('../../../models/User');

exports.addmagnet = async (req, res) => {
  const { magnetLink } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Check storage usage
    const estimatedSize = 10 * 1024 * 1024; // Assume each magnet link represents 10 MB
    const planLimit = user.subscription === 'premium' ? 50 * 1024 * 1024 * 1024 : 10 * 1024 * 1024 * 1024;

    if (user.storageUsed + estimatedSize > planLimit) {
      return res.status(400).json({ error: 'Storage limit exceeded' });
    }

    console.log('Adding magnet link:', magnetLink);
    const engine = torrentStream(magnetLink); // Create a torrent engine instance

    // Set a timeout for the engine to prevent hanging indefinitely
    const timeout = setTimeout(() => {
      engine.destroy(); // Forcefully close the engine
      res.status(500).json({ error: 'Torrent engine is taking too long to respond.' });
    }, 20000); // 20 seconds timeout

    engine.on('ready', () => {
      clearTimeout(timeout); // Clear timeout if it's ready in time

      const torrentData = {
        user: req.user.id,
        magnetLink,
        fileName: engine.torrent.name || 'Unknown', // Actual file name
        size: engine.torrent.length || 0, // Size in bytes
        leechers: engine.numPeers || 0, // Number of leechers
        seeders: engine.numPeers || 0, // Estimates seeders from peers
        progress: 0,
        status: 'queued',
      };

      // Create a new Torrent document
      const newTorrent = new TorrentModel(torrentData);

      // Save the torrent information to the database
      newTorrent.save()
        .then(() => {
          user.storageUsed += estimatedSize; // Update user storage usage
          user.save();

          // Respond with the created torrent details
          res.status(201).json({ message: 'Magnet link added successfully.', torrent: newTorrent });
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        });
    });

    // Handle errors
    engine.on('error', (err) => {
      clearTimeout(timeout); // Clear timeout on error
      console.error(`Engine error: ${err.message}`);
      res.status(500).json({ error: 'Failed to add magnet link.' });
    });

  } catch (error) {
    console.error('Error in addmagnet:', error);
    res.status(500).json({ error: error.message });
  }
};
