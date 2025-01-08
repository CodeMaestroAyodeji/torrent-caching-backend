// services/downloadManager.js

const TorrentClient = require('./torrentClient');
const Torrent = require('../models/Torrent');
const WebSocketManager = require('./webSocketManager');
const TorrentEventHandler = require('../utils/torrentEventHandler');
const formatFileSize = require('../utils/formatters');
const { uploadFileToB2 } = require('../utils/backblaze'); 


class DownloadManager {  
    static async startDownload(magnetLink, userId) {  
        const client = TorrentClient.getClient();  

        const torrentInfo = {  
            user: userId,  
            magnetLink,  
            fileName: [],  
            size: 0,  
            formattedSize: '0.00B',  
            leechers: 0,  
            seeders: 0,  
            progress: 0,  
            status: 'queued'  
        };  

        const torrentDoc = new Torrent(torrentInfo);  
        await torrentDoc.save();  

        return new Promise((resolve, reject) => {  
            const torrent = client.add(magnetLink, { path: './downloads' }); // Temporary path for WebTorrent  
            let lastProgress = 0;  

            torrent.on('metadata', async () => {  
                await TorrentEventHandler.handleMetadata(torrent, torrentDoc, userId);  
            });  

            torrent.on('download', async () => {  
                lastProgress = await TorrentEventHandler.handleDownload(torrent, torrentDoc, userId, lastProgress);  
            });  

            torrent.on('done', async () => {  
                // Once download is done, upload to Backblaze  
                try {  
                    const files = torrent.files; // Get the downloaded files  
                    for (const file of files) {  
                        const filePath = file.path; // Temporary path  
                        const fileName = file.name; // Get the original file name  
                        await uploadFileToB2(filePath, fileName); // Upload to Backblaze  
                    }  
                } catch (uploadError) {  
                    console.error('Error uploading file to Backblaze:', uploadError);  
                    await TorrentEventHandler.handleError(uploadError, torrentDoc, userId);  
                    reject(uploadError);  
                    return;  
                }  

                await TorrentEventHandler.handleComplete(torrent, torrentDoc, userId);  
                client.remove(torrent.infoHash, { destroyStore: false });  
                resolve(torrentDoc);  
            });  

            torrent.on('error', async (err) => {  
                await TorrentEventHandler.handleError(err, torrentDoc, userId);  
                reject(err);  
            });  
        });  
    }  


    static async resumeDownload(torrentId, userId) {
        try {
            const torrentDoc = await Torrent.findOne({ _id: torrentId, user: userId });
            if (!torrentDoc) {
                throw new Error('Torrent not found');
            }

            const client = TorrentClient.getClient();
            let torrent = client.get(torrentDoc.magnetLink);

            if (!torrent) {
                // If torrent is not in client, add it back
                torrent = client.add(torrentDoc.magnetLink, { path: './downloads' });
                let lastProgress = torrentDoc.progress || 0;

                // Reattach all event listeners
                torrent.on('download', async () => {
                    const progress = Math.floor(torrent.progress * 100);
                    
                    if (progress !== lastProgress) {
                        lastProgress = progress;
                        const update = {
                            progress,
                            status: 'downloading',
                            leechers: torrent.numPeers,
                            seeders: torrent.numPeers
                        };

                        await Torrent.findByIdAndUpdate(torrentId, update);
                        WebSocketManager.broadcastToUser(userId, {
                            type: 'progress',
                            torrentId,
                            ...update
                        });
                    }
                });

                torrent.on('done', async () => {
                    const update = {
                        progress: 100,
                        status: 'completed',
                        leechers: torrent.numPeers,
                        seeders: torrent.numPeers
                    };

                    await Torrent.findByIdAndUpdate(torrentId, update);
                    WebSocketManager.broadcastToUser(userId, {
                        type: 'completed',
                        torrentId,
                        ...update
                    });
                });

                torrent.on('error', async (err) => {
                    const update = {
                        status: 'error',
                        error: err.message
                    };

                    await Torrent.findByIdAndUpdate(torrentId, update);
                    WebSocketManager.broadcastToUser(userId, {
                        type: 'error',
                        torrentId,
                        ...update
                    });
                });
            }

            // Update database status
            await Torrent.findByIdAndUpdate(torrentId, { 
                status: 'downloading'
            });

            return torrentDoc;
        } catch (error) {
            console.error('Error resuming download:', error);
            throw error;
        }
    }

    static async pauseDownload(torrentId, userId) {
        try {
            const torrentDoc = await Torrent.findOne({ _id: torrentId, user: userId });
            if (!torrentDoc) {
                throw new Error('Torrent not found');
            }

            const client = TorrentClient.getClient();
            const torrent = client.get(torrentDoc.magnetLink);

            if (torrent) {
                // Pause the torrent by removing it from the client but keeping the files
                client.remove(torrent.infoHash, { destroyStore: false });

                // Save the current progress before pausing
                const progress = Math.floor(torrent.progress * 100);
                const update = {
                    progress,
                    status: 'paused',
                    leechers: torrent.numPeers,
                    seeders: torrent.numPeers
                };

                await Torrent.findByIdAndUpdate(torrentId, update);
                WebSocketManager.broadcastToUser(userId, {
                    type: 'paused',
                    torrentId,
                    ...update
                });
            }

            return torrentDoc;
        } catch (error) {
            console.error('Error pausing download:', error);
            throw error;
        }
    }

    static async cancelDownload(torrentId, userId) {
        try {
            const torrentDoc = await Torrent.findOne({ _id: torrentId, user: userId });
            if (!torrentDoc) {
                throw new Error('Torrent not found');
            }
    
            const client = TorrentClient.getClient();
            const torrent = client.get(torrentDoc.magnetLink);
    
            if (torrent) {
                // Remove torrent and delete files
                client.remove(torrent.infoHash, { destroyStore: true });
            }
    
            // Update status to cancelled
            const update = {
                status: 'cancelled',
                progress: torrentDoc.progress // Preserve the progress where it was cancelled
            };
    
            await Torrent.findByIdAndUpdate(torrentId, update);
            WebSocketManager.broadcastToUser(userId, {
                type: 'cancelled',
                torrentId,
                ...update
            });
    
            return torrentDoc;
        } catch (error) {
            console.error('Error cancelling download:', error);
            throw error;
        }
    }
    
    static async deleteDownload(torrentId, userId) {
        try {
            const torrentDoc = await Torrent.findOne({ _id: torrentId, user: userId });
            if (!torrentDoc) {
                throw new Error('Torrent not found');
            }
    
            const client = TorrentClient.getClient();
            const torrent = client.get(torrentDoc.magnetLink);
    
            if (torrent) {
                // Remove torrent and delete files
                client.remove(torrent.infoHash, { destroyStore: true });
            }
    
            // Remove from database
            await Torrent.findByIdAndDelete(torrentId);
            
            WebSocketManager.broadcastToUser(userId, {
                type: 'deleted',
                torrentId
            });
    
            return { success: true };
        } catch (error) {
            console.error('Error deleting download:', error);
            throw error;
        }
    }

}

module.exports = DownloadManager;