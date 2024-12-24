// services/torrentClient.js

const WebTorrent = require('webtorrent');

// Singleton WebTorrent client
class TorrentClient {
    constructor() {
        if (!TorrentClient.instance) {
            this.client = new WebTorrent();
            TorrentClient.instance = this;
        }
        return TorrentClient.instance;
    }

    getClient() {
        return this.client;
    }

    destroy() {
        if (this.client) {
            this.client.destroy();
        }
    }
}

module.exports = new TorrentClient();