const torrentStream = require('torrent-stream');
const Torrent = require('../../../models/Torrent'); // Adjust the path as necessary
const User = require('../../../models/User');
const { broadcastTorrentProgress } = require('../../../websocket/websocketServer');

exports.startDownload = async (req, res) => {  
    const { torrentId } = req.body;  

    try {  
        const existingTorrent = await Torrent.findOne({ _id: torrentId, status: 'queued' });  

        if (!existingTorrent) {  
            return res.status(404).json({ error: 'Torrent not found or not queued.' });  
        }  

        const engine = torrentStream(existingTorrent.magnetLink);  

        engine.on('ready', async () => {  
            console.log(`Torrent engine is ready. Info hash: ${engine.torrent.infoHash}`);  
            await Torrent.findByIdAndUpdate(torrentId, { status: 'downloading' });  
            
            // Select all files in the torrent
            engine.files.forEach(file => {
                file.select(); // Selects the file for downloading
                console.log('Selected file:', file.name);
            });

            await broadcastTorrentProgress(req.user.id, torrentId);  
        });  

        engine.on('download', async (bytes) => {            
            const totalDownloaded = engine.swarm.downloaded;  
            const totalSize = engine.torrent.length;  
        
            console.log(`Downloaded bytes: ${bytes}`);
            console.log('Total downloaded:', totalDownloaded);
            console.log('Total size:', totalSize);
        
            if (!totalSize) {  
                console.log('Total size is not defined yet, skip progress calculation.');  
                return;  
            }  
        
            const progressPercentage = Math.min((totalDownloaded / totalSize) * 100, 100).toFixed(2);  
        
            try {
                await Torrent.findByIdAndUpdate(torrentId, { progress: progressPercentage });
                await broadcastTorrentProgress(req.user.id, torrentId);  
                console.log(`Current Progress: ${progressPercentage}%`);  
            } catch (updateError) {
                console.error('Error updating progress in the database:', updateError);
            }
        
            if (progressPercentage === '100.00') {  
                console.log('Download completed, updating status...');  
                await Torrent.findByIdAndUpdate(torrentId, { status: 'completed' });  
            }  
        });
          

        engine.on('error', (err) => {  
            console.error(`Engine error: ${err.message}`);  
            res.status(500).json({ error: 'Failed to add magnet link.' });  
        });  

        res.status(200).json({ message: 'Torrent download started successfully.', torrentId });  

    } catch (error) {  
        console.error('Error in startDownload:', error);  
        res.status(500).json({ error: error.message });  
    }  
};
