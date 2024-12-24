const TorrentModel = require('../../../models/Torrent');
const path = require('path');
const fs = require('fs');

exports.downloadCompleted = async (req, res) => {
    const { torrentId } = req.params; // Assuming torrentId is sent as a URL parameter

    try {
        // Find the torrent in the database
        const torrent = await TorrentModel.findById(torrentId);

        if (!torrent) {
            return res.status(404).json({ error: 'Torrent not found.' });
        }

        // Check if the torrent status is 'completed'
        if (torrent.status !== 'completed') {
            return res.status(400).json({ error: 'Torrent is not completed yet.' });
        }

        // Define the file location (assuming it is stored based on your application's structure)
        const filePath = path.join(__dirname, '..', 'downloads', torrent.fileName); // Adjusted to your file path structure

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on the server.' });
        }

        // Set headers for file download
        res.download(filePath, torrent.fileName, (err) => {
            if (err) {
                console.error('Error while downloading the file:', err);
                res.status(500).json({ error: 'Failed to download the file.' });
            }
        });

    } catch (error) {
        console.error('Error in downloadCompleted:', error);
        res.status(500).json({ error: error.message });
    }
};
