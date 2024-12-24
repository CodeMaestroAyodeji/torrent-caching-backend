// services/torrentEventHandler.js

const Torrent = require('../models/Torrent');
const WebSocketManager = require('../services/webSocketManager');
const { formatFileSize } = require('../utils/formatters');

class TorrentEventHandler {
    static async handleMetadata(torrent, torrentDoc, userId) {
        const update = {
            fileName: [torrent.files[0].name], // Only first filename
            size: torrent.length,
            formattedSize: formatFileSize(torrent.length),
            status: 'downloading',
            leechers: torrent.numPeers,
            seeders: torrent.numPeers
        };

        await Torrent.findByIdAndUpdate(torrentDoc._id, update);
        WebSocketManager.broadcastToUser(userId, {
            type: 'metadata',
            torrentId: torrentDoc._id,
            ...update
        });
    }

    static async handleDownload(torrent, torrentDoc, userId, lastProgress) {
        const progress = Math.floor(torrent.progress * 100);
        
        if (progress !== lastProgress) {
            const update = {
                progress,
                status: progress === 100 ? 'completed' : 'downloading',
                leechers: torrent.numPeers,
                seeders: torrent.numPeers
            };

            await Torrent.findByIdAndUpdate(torrentDoc._id, update);
            WebSocketManager.broadcastToUser(userId, {
                type: 'progress',
                torrentId: torrentDoc._id,
                ...update
            });
            return progress;
        }
        return lastProgress;
    }

    static async handleComplete(torrent, torrentDoc, userId) {
        const update = {
            progress: 100,
            status: 'completed',
            leechers: torrent.numPeers,
            seeders: torrent.numPeers
        };

        await Torrent.findByIdAndUpdate(torrentDoc._id, update, { new: true });
        WebSocketManager.broadcastToUser(userId, {
            type: 'completed',
            torrentId: torrentDoc._id,
            ...update
        });
    }

    static async handleError(err, torrentDoc, userId) {
        const update = {
            status: 'error',
            error: err.message
        };

        await Torrent.findByIdAndUpdate(torrentDoc._id, update);
        WebSocketManager.broadcastToUser(userId, {
            type: 'error',
            torrentId: torrentDoc._id,
            ...update
        });
    }
}

module.exports = TorrentEventHandler;
