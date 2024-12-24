// models/Torrent.js
const mongoose = require('mongoose');

const torrentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    magnetLink: {
        type: String,
        required: false,
    },
    progress: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['queued', 'downloading', 'completed', 'paused', 'stopped', 'cancelled'],
        default: 'queued',
    },
    fileName: {
        type: [String],
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    formattedSize: {
        type: String,
        required: true,
    },
    leechers: {
        type: Number,
        default: 0,
    },
    seeders: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Torrent = mongoose.model('Torrent', torrentSchema);
module.exports = Torrent;
