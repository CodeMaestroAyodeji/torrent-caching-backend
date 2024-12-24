const Torrent = require('../models/Torrent');
const { calculateTotalSize } = require('../utils/fileUtils');

exports.getFiles = async (req, res) => {
    try {
        const userId = req.user.id;

        const torrents = await Torrent.find({ user: userId })
            .sort({ createdAt: -1 });

        const downloadedFiles = torrents.filter(
            torrent => torrent.status === 'completed'
        );

        const undownloadedFiles = torrents.filter(
            torrent => ['paused', 'stopped', 'queued', 'downloading'].includes(torrent.status)
        );

        return res.json({
            success: true,
            results: torrents,
            stats: {
                downloadedFiles: {
                    count: downloadedFiles.length,
                    totalSize: calculateTotalSize(downloadedFiles)
                },
                undownloadedFiles: {
                    count: undownloadedFiles.length,
                    totalSize: calculateTotalSize(undownloadedFiles)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching files:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Failed to fetch files'
        });
    }
};