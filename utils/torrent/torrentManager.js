// utils/torrent/torrentManager.js
const axios = require('axios');
const http = require('http'); // or 'https' if using https

const Torrent = require('../../models/Torrent');
const { simulateDownload } = require('./downloadProgress');
let WebTorrent;

// Initialize WebTorrent dynamically
const initWebTorrent = async () => {
    if (!WebTorrent) {
        WebTorrent = await import('webtorrent').then(module => module.default);
    }
};



const startTorrent = async (torrentId) => {
    await initWebTorrent();
    const client = new WebTorrent();

    const torrent = await Torrent.findById(torrentId);
    if (!torrent) {
        throw new Error('Torrent not found');
    }

    const url = `http://localhost:5000/api/torrents/start${torrentId}/file`;
    const torrentFileBuffer = await new Promise((resolve, reject) => {
        http.get(url, (res) => {
            const data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
            res.on('error', reject);
        });
    });

    client.add(torrentFileBuffer, (t) => {
        simulateDownload(torrentId);
    });

    torrent.status = 'downloading';
    await torrent.save();
};



// Pause torrent download
const pauseTorrent = async (torrentId) => {
    // Logic to pause the torrent
};

// Stop torrent download
const stopTorrent = async (torrentId) => {
    // Logic to stop the torrent download
};

// Cancel torrent download
const cancelTorrent = async (torrentId) => {
    // Logic to cancel the torrent download
};

// Export the functions
module.exports = {
    startTorrent,
    pauseTorrent,
    stopTorrent,
    cancelTorrent,
};
