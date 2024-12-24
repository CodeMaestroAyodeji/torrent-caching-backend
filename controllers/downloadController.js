// controllers/downloadController.js
const Torrent = require('../models/Torrent');
const TorrentClient = require('../services/torrentClient');
const WebSocketManager = require('../services/webSocketManager');
const DownloadManager = require('../services/downloadManager');


// Start Downloading a torrent  
exports.startDownload = async (req, res) => {  
    const { torrentId } = req.params;  
    
    console.log('Attempting to start download for torrent ID:', torrentId);  
    console.log('User ID:', req.user.id);  
    
    try {  
        // Find the torrent and verify ownership and status  
        const torrent = await Torrent.findOne({   
            _id: torrentId,   
            user: req.user.id,  
            status: 'queued' // Only start queued torrents  
        });  

        if (!torrent) {  
            return res.status(404).json({   
                success: false,   
                error: 'Torrent not found or not in queued state'   
            });  
        }  

        console.log('Torrent found:', torrent);  

        // Start the download using DownloadManager  
        const updatedTorrent = await DownloadManager.startDownload(  
            torrent.magnetLink,   
            req.user.id,  
            torrentId // Pass the existing torrent ID  
        );  
        
        console.log('Download started successfully for torrent:', updatedTorrent);  

        return res.json({  
            success: true,  
            message: 'Download started successfully',  
            torrent: updatedTorrent  
        });  

    } catch (error) {  
        console.error('Error starting download:', error);  
        return res.status(500).json({   
            success: false,   
            error: 'Failed to start download'  
        });  
    }  
};

// Pause an active download
exports.pauseDownload = async (req, res) => {
    const { torrentId } = req.params;
    
    try {
        const torrent = await DownloadManager.pauseDownload(torrentId, req.user.id);
        
        return res.json({ 
            success: true, 
            message: 'Download paused successfully',
            torrent
        });
    } catch (error) {
        console.error('Error pausing download:', error);
        return res.status(500).json({ error: error.message });
    }
};

// Resume a paused download
exports.resumeDownload = async (req, res) => {
    const { torrentId } = req.params;
    
    try {
        const torrent = await DownloadManager.resumeDownload(torrentId, req.user.id);
        
        return res.json({ 
            success: true, 
            message: 'Download resumed successfully',
            torrent
        });
    } catch (error) {
        console.error('Error resuming download:', error);
        return res.status(500).json({ error: error.message });
    }
};

// Cancel an active download
exports.cancelDownload = async (req, res) => {
    const { torrentId } = req.params;
    
    try {
        const torrent = await DownloadManager.cancelDownload(torrentId, req.user.id);
        
        return res.json({ 
            success: true, 
            message: 'Download cancelled successfully',
            torrent
        });
    } catch (error) {
        console.error('Error cancelling download:', error);
        return res.status(500).json({ error: error.message });
    }
};


// Delete a download and its data
exports.deleteDownload = async (req, res) => {
    const { torrentId } = req.params;
    
    try {
        await DownloadManager.deleteDownload(torrentId, req.user.id);
        
        return res.json({ 
            success: true, 
            message: 'Download deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting download:', error);
        return res.status(500).json({ error: error.message });
    }
};

