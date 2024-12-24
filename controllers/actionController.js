// controllers/actionController.js
const Torrent = require('../models/Torrent');
// Start downloading a torrent
exports.startTorrent = async (req, res) => {
    const { id } = req.params;
    try {
        const torrent = await Torrent.findById(id);
        if (!torrent) return res.status(404).json({ message: 'Torrent not found' });

        // Check if the torrent is already downloading
        if (torrent.status === 'downloading') {
            return res.status(400).json({ message: 'Torrent is already downloading' });
        }

        // Ensure size is defined
        if (torrent.size === undefined || torrent.size === null) {
            return res.status(400).json({ message: 'Torrent size is required' });
        }

        // Logic to start the torrent download
        torrent.status = 'downloading';
        torrent.leechers = torrent.leechers || 0;
        torrent.seeders = torrent.seeders || 0;

        await torrent.save();

        // Send response with current progress
        res.status(200).json(torrent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Pause a torrent
exports.pauseTorrent = async (req, res) => {
  const { id } = req.params;
  try {
    const torrent = await Torrent.findById(id);
    if (!torrent) return res.status(404).json({ message: 'Torrent not found' });

    // Logic to pause the torrent download
    torrent.status = 'paused';
    await torrent.save();

    res.status(200).json(torrent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Resume a paused torrent
exports.resumeTorrent = async (req, res) => {
  const { id } = req.params;
  try {
    const torrent = await Torrent.findById(id);
    if (!torrent) return res.status(404).json({ message: 'Torrent not found' });

    // Logic to resume the torrent download
    torrent.status = 'downloading';
    await torrent.save();

    res.status(200).json(torrent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stop a torrent
exports.stopTorrent = async (req, res) => {
  const { id } = req.params;
  try {
    const torrent = await Torrent.findById(id);
    if (!torrent) return res.status(404).json({ message: 'Torrent not found' });

    // Logic to stop the torrent download
    torrent.status = 'stopped';
    await torrent.save();

    res.status(200).json(torrent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a torrent
exports.deleteTorrent = async (req, res) => {
  const { id } = req.params;
  try {
    const torrent = await Torrent.findByIdAndDelete(id);
    if (!torrent) return res.status(404).json({ message: 'Torrent not found' });

    res.status(200).json({ message: 'Torrent deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download a torrent
exports.downloadTorrent = async (req, res) => {
  const { id } = req.params;
  try {
    const torrent = await Torrent.findById(id);
    if (!torrent) return res.status(404).json({ message: 'Torrent not found' });

    // Logic to handle downloading the torrent file
    // This might involve streaming the file back to the client or initiating a download

    res.status(200).json({ message: 'Download initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Zip and download a torrent
exports.zipAndDownloadTorrent = async (req, res) => {
  const { id } = req.params;
  try {
    const torrent = await Torrent.findById(id);
    if (!torrent) return res.status(404).json({ message: 'Torrent not found' });

    // Logic to zip and download the torrent file
    // This might involve creating a zip file and sending it to the client

    res.status(200).json({ message: 'Zip and download initiated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get real-time progress of a torrent
exports.getTorrentProgress = async (req, res) => {
  const { id } = req.params;
  try {
    const torrent = await Torrent.findById(id);
    if (!torrent) return res.status(404).json({ message: 'Torrent not found' });

    res.status(200).json({ progress: torrent.progress, status: torrent.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
