// services/torrentService.js

const WebTorrent = require('webtorrent');
const Torrent = require('../models/Torrent');
const { createProgressBar } = require('../utils/progressBar');

const activeTorrents = new Map();

const getTorrentInfo = (torrent, userId) => ({
    user: userId,
    magnetLink: torrent.magnetLink || torrent,
    fileName: torrent.files ? torrent.files.map(file => file.name) : [],
    size: torrent.length || 0,
    leechers: torrent.numPeers || 0,
    seeders: torrent.numPeers || 0,
    progress: 0,
    status: 'queued'
});

const startTorrentDownload = async (magnetLink, userId) => {
    try {
        const client = new WebTorrent();
        
        return new Promise((resolve, reject) => {
            const torrentData = getTorrentInfo({ magnetLink }, userId);
            const newTorrent = new Torrent(torrentData);

            client.add(magnetLink, { path: './downloads' }, async (torrent) => {
                try {
                    await newTorrent.save();
                    activeTorrents.set(newTorrent._id.toString(), { torrent, client });

                    const bar = createProgressBar();
                    bar.start(100, 0);

                    torrent.on('download', async (bytes) => {
                        if (torrent.progress < 1) {
                            const progress = Math.floor(torrent.progress * 100);
                            bar.update(progress);

                            await Torrent.findByIdAndUpdate(newTorrent._id, {
                                progress,
                                status: progress === 100 ? 'completed' : 'downloading'
                            });
                        }
                    });

                    torrent.on('done', async () => {
                        bar.update(100);
                        bar.stop();

                        await Torrent.findByIdAndUpdate(newTorrent._id, { 
                            progress: 100, 
                            status: 'completed' 
                        });

                        cleanupTorrent(newTorrent._id.toString());
                        resolve(newTorrent);
                    });

                    torrent.on('error', async (err) => {
                        bar.stop();
                        await Torrent.findByIdAndUpdate(newTorrent._id, { 
                            status: 'error',
                            error: err.message 
                        });
                        cleanupTorrent(newTorrent._id.toString());
                        reject(err);
                    });

                } catch (error) {
                    cleanupTorrent(newTorrent._id.toString());
                    reject(error);
                }
            });
        });
    } catch (error) {
        console.error('Error in startTorrentDownload:', error);
        throw error;
    }
};

const cleanupTorrent = (torrentId) => {
    const torrentData = activeTorrents.get(torrentId);
    if (torrentData) {
        const { torrent, client } = torrentData;
        torrent.removeAllListeners();
        client.destroy();
        activeTorrents.delete(torrentId);
    }
};

module.exports = {
    startTorrentDownload,
    cleanupTorrent
};