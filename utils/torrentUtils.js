// utils/torrentUtils.js

const WebTorrent = require('webtorrent');
const cliProgress = require('cli-progress');

const getTorrentInfo = (torrent) => {
    return {
        user: torrent.user,
        magnetLink: torrent.magnetLink,
        fileName: Array.isArray(torrent.files) ? torrent.files.map(file => file.name) : [],
        size: torrent.length || 0,
        leechers: torrent.numLeechers || 0,
        seeders: torrent.numSeeders || 0,
        progress: 0,
        status: 'queued',
    };
};

const createProgressBar = () => {
    return new cliProgress.SingleBar({
        format: 'Downloading |{bar}| {percentage}% || {value}/{total} Chunks',
        hideCursor: true,
    }, cliProgress.Presets.shades_classic);
};

module.exports = {
    getTorrentInfo,
    createProgressBar
};