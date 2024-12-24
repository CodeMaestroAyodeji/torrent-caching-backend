// websocket/broadcaster

const WebSocket = require('ws');
const Torrent = require('../models/Torrent');
const clientManager = require('./clientManager');

class Broadcaster {
    async broadcastProgress(userId, torrentId) {
        if (!clientManager.isClientConnected(userId)) {
            console.log(`No active WebSocket connection for userId: ${userId}`);
            return;
        }

        const torrent = await Torrent.findById(torrentId);
        if (!torrent) {
            console.log(`No torrent found with id: ${torrentId}`);
            return;
        }

        const progressData = {
            type: 'progress',
            torrentId,
            progress: torrent.progress,
            status: torrent.status,
        };

        console.log(`Broadcasting to userId: ${userId}`, progressData);
        clientManager.getClient(userId).send(JSON.stringify(progressData));
    }

    broadcastEvent(userId, torrentId, event) {
        if (!clientManager.isClientConnected(userId)) return;

        const payload = { type: 'event', torrentId, event };
        console.log(`Broadcasting event '${event}' to userId: ${userId}`, payload);
        clientManager.getClient(userId).send(JSON.stringify(payload));
    }
}

module.exports = new Broadcaster();