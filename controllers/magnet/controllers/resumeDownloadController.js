const WebSocket = require('ws');
const TorrentModel = require('../../../models/Torrent');
const { broadcastTorrentProgress, clients } = require('../../../websocket/websocketServer');

exports.resumeDownload = async (req, res) => {
    const { torrentId } = req.body;

    try {
        // Find the torrent in the database
        const torrent = await TorrentModel.findById(torrentId);
        
        if (!torrent) {
            return res.status(404).json({ error: 'Torrent not found.' });
        }

        // Check if the engine is still active
        const engine = clients.get(torrent.user.toString(), torrentId); // Adjust this line if necessary

        if (!engine) {
            return res.status(400).json({ error: 'No paused download found for this torrent.' });
        }

        // Resume the torrent engine
        engine.resume();

        // Update the torrent status in the database
        torrent.status = 'downloading';  // Update status to downloading
        await torrent.save();

        // Notify the user via WebSocket
        if (clients.has(torrent.user.toString())) {
            const ws = clients.get(torrent.user.toString());
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ torrentId, event: 'resumed' }));
            }
        }

        res.status(200).json({ message: 'Torrent download resumed successfully.', torrentId });

    } catch (error) {
        console.error('Error resuming download:', error);
        res.status(500).json({ error: error.message });
    }
};
