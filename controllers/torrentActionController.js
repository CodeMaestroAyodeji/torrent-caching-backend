// controllers/torrentActionController.js  

let WebTorrent;  
let client; // Global client instance  
const Torrent = require('../models/Torrent');  
const { broadcastTorrentProgress } = require('../websocket/websocketServer');   

const initWebTorrent = async () => {  
    if (!WebTorrent) {  
        WebTorrent = await import('webtorrent').then(module => module.default);  
    }  
    // Ensure to create an instance only if it doesn't exist  
    if (!client) {  
        client = new WebTorrent(); // Initialize the client instance only once  
    }  
};  

// Method to slow down the progress simulation  
const simulateSlowProgress = (callback, delay) => {  
    return new Promise(resolve => {  
        setTimeout(() => {  
            callback();  
            resolve();  
        }, delay);  
    });  
};  

exports.startsDownload = async (req, res) => {  
    try {  
        await initWebTorrent(); // Initialize WebTorrent  
        const { torrentId } = req.body;  

        const torrent = await Torrent.findById(torrentId);  
        if (!torrent) {  
            return res.status(404).json({ message: 'Torrent not found or not queued.' });  
        }  

        torrent.status = 'downloading';  
        await torrent.save();  

        let isSavingProgress = false; // Flag to manage save operations  
        let lastSavedProgress = 0;  

        // Add the torrent  
        const downloadTorrent = client.add(torrent.magnetLink, (torrent) => {  
            console.log(`Started downloading: ${torrent.infoHash}`);  
        });  

        downloadTorrent.on('download', async () => {  
            const progress = (downloadTorrent.progress * 100).toFixed(2); // Progress in percentage  
            torrent.progress = progress;  

            // Update progress every 10%  
            if (!isSavingProgress && (Math.floor(progress / 10) > Math.floor(lastSavedProgress / 10))) {  
                isSavingProgress = true; // Set flag to true  
                console.log(`Download progress: ${progress}%`); // Log the progress  

                try {  
                    await torrent.save(); // Save progress  
                    lastSavedProgress = progress;   
                    broadcastTorrentProgress(torrent.user.toString(), torrent._id.toString());  
                } catch (err) {  
                    console.error(`Error saving progress: ${err.message}`);  
                } finally {  
                    isSavingProgress = false; // Reset flag  
                }  
            }  
        });  

        // Handle completion  
        downloadTorrent.on('done', async () => {  
            console.log(`Torrent ${downloadTorrent.infoHash} download complete!`);  
            torrent.status = 'completed';  
            torrent.progress = 100;  

            // Ensure this save occurs only once  
            if (!isSavingProgress) {  
                isSavingProgress = true; // Set flag to true  
                try {  
                    await torrent.save(); // Save the completed status  
                    broadcastTorrentProgress(torrent.user.toString(), torrent._id.toString());  
                } catch (err) {  
                    console.error(`Error saving completed status: ${err.message}`);  
                } finally {  
                    isSavingProgress = false; // Reset flag  
                }  
            }  
        });  

        // Handle errors  
        downloadTorrent.on('error', async (err) => {  
            console.error(`Error downloading torrent ${downloadTorrent.infoHash}: ${err.message}`);  
            torrent.status = 'paused';  
            await torrent.save();  
        });  

        res.status(200).json({ message: 'Download started for the specified torrent.', torrent });  
    } catch (error) {  
        console.error('Error starting download:', error);  
        res.status(500).json({ error: 'Failed to start downloading the torrent.' });  
    }  
};  

// Pause Download Method  
exports.pausesDownload = async (req, res) => {  
    try {  
        await initWebTorrent(); // Ensure WebTorrent is initialized  
        const { torrentId } = req.body;   

        const torrent = await Torrent.findById(torrentId);  
        if (!torrent) {  
            return res.status(404).json({ message: 'Torrent not found.' });  
        }  

        const downloadTorrent = client.get(torrent.magnetLink);   
        if (downloadTorrent && !downloadTorrent.paused) {  
            downloadTorrent.pause();  
            torrent.status = 'paused';  
            await torrent.save();  
            console.log(`Paused torrent: ${torrent.infoHash}`);  
            
            // Optionally detach the download event to stop progress updates.  
            downloadTorrent.off('download');  

            broadcastTorrentProgress(torrent.user.toString(), torrent._id.toString());  
            return res.status(200).json({ message: 'Download paused successfully.' });  
        } else {  
            return res.status(400).json({ message: 'Torrent is already paused or not downloading.' });  
        }  
    } catch (error) {  
        console.error('Error pausing download:', error);  
        res.status(500).json({ error: 'Failed to pause downloading the torrent.' });  
    }  
};  

// Resume Download Method  
exports.resumesDownload = async (req, res) => {  
    try {  
        await initWebTorrent();  
        const { torrentId } = req.body;   

        const torrent = await Torrent.findById(torrentId);  
        if (!torrent) {  
            return res.status(404).json({ message: 'Torrent not found.' });  
        }  

        // Get the downloadTorrent using infoHash or directly from the client  
        const downloadTorrent = client.get(torrent.magnetLink);   
        
        if (downloadTorrent && downloadTorrent.paused) {  
            downloadTorrent.resume();  
            torrent.status = 'downloading';  
            await torrent.save();  
            console.log(`Resumed torrent: ${torrent.infoHash}`);  

            // Register the download event after resuming  
            downloadTorrent.on('download', async () => {  
                await simulateSlowProgress(() => {  
                    const progress = (downloadTorrent.progress * 100).toFixed(2); // Progress in percentage  
                    torrent.progress = progress;  

                    // Update progress every 10%  
                    if (!isSavingProgress && (Math.floor(progress / 10) > Math.floor(lastSavedProgress / 10))) {  
                        isSavingProgress = true;  
                        console.log(`Download progress: ${progress}%`); // Log the progress  

                        torrent.save()  
                            .then(() => {  
                                lastSavedProgress = progress;   
                                broadcastTorrentProgress(torrent.user.toString(), torrent._id.toString());  
                            })  
                            .catch(err => {  
                                console.error(`Error saving progress: ${err.message}`);  
                            })  
                            .finally(() => {  
                                isSavingProgress = false;  
                            });  
                    }  
                }, 1000); // 1000ms delay to simulate slow download  
            });  

            broadcastTorrentProgress(torrent.user.toString(), torrent._id.toString());  
            return res.status(200).json({ message: 'Download resumed successfully.' });  
        } else {  
            return res.status(400).json({ message: 'Torrent is already downloading or not found.' });  
        }  
    } catch (error) {  
        console.error('Error resuming download:', error);  
        res.status(500).json({ error: 'Failed to resume downloading the torrent.' });  
    }  
};