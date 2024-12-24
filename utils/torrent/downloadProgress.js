// utils/torrent/downloadProgress.js

const Torrent = require('../../models/Torrent');
const { broadcastTorrentProgress } = require('../../websocket/websocketServer');

// Simulate a torrent download process
const simulateDownload = async (torrentId) => {
    let progress = 0;

    const interval = setInterval(async () => {
        progress += 10; // Simulate progress

        const torrent = await Torrent.findById(torrentId);
        if (torrent) {
            torrent.progress = progress;
            torrent.status = progress < 100 ? 'downloading' : 'completed';
            await torrent.save();

            // Notify the user via WebSocket
            broadcastTorrentProgress(torrent.user.toString(), torrentId);

            if (progress >= 100) {
                clearInterval(interval);
            }
        }
    }, 1000);
};

// Export the simulateDownload function
module.exports = {
    simulateDownload,
};
