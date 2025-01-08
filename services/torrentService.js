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

                    torrent.on('done', async () => {  
                        // Handle the completion and upload to Backblaze  
                        try {  
                            const files = torrent.files; // Get the downloaded files  
                            for (const file of files) {  
                                const fileName = file.name; // Get the original file name  
                                await uploadFileToB2(file.path, fileName); // Upload to Backblaze  
                            }  
                            // Update the torrent status to 'completed' after all uploads  
                            await Torrent.findByIdAndUpdate(newTorrent._id, { status: 'completed' });  
                            resolve(newTorrent);  // Resolve the promise with the newTorrent data  
                        } catch (uploadError) {  
                            console.error('Error uploading file to Backblaze:', uploadError);  
                            await Torrent.findByIdAndUpdate(newTorrent._id, { status: 'error' });  
                            cleanupTorrent(newTorrent._id.toString()); // Cleanup torrent resources  
                            reject(uploadError);  // Reject the promise with the upload error  
                        }  
                    });  

                    torrent.on('error', async (err) => {  
                        console.error('Torrent error:', err);  
                        await Torrent.findByIdAndUpdate(newTorrent._id, { status: 'error', error: err.message });  
                        cleanupTorrent(newTorrent._id.toString()); // Cleanup on error  
                        reject(err);  
                    });  
                } catch (error) {  
                    console.error('Error in adding torrent:', error);  
                    cleanupTorrent(newTorrent._id.toString()); // Cleanup on error  
                    reject(error);  
                }  
            });  
        });  
    } catch (error) {  
        console.error('Error starting torrent download:', error);  
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