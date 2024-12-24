const WebSocket = require('ws');
const Torrent = require('../../../models/Torrent');
const { broadcastTorrentProgress, clients } = require('../../../websocket/websocketServer');

exports.pauseDownload = async (req, res) => {
    const { torrentId } = req.body;

    try {
        // Find the torrent in the database
        const torrent = await TorrentModel.findById(torrentId);
        
        if (!torrent) {
            return res.status(404).json({ error: 'Torrent not found.' });
        }

        // Retrieve the engine associated with the torrent
        const userId = torrent.user.toString();
        const engine = clients.get(userId, torrentId); // Adjust this line if necessary

        if (!engine) {
            return res.status(400).json({ error: 'No active download found for this torrent.' });
        }

        // Pause the torrent engine
        engine.pause();

        // Update the torrent status in the database
        torrent.status = 'paused';
        await torrent.save();

        // Notify the user via WebSocket
        const ws = clients.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ torrentId, event: 'paused' }));
        }

        res.status(200).json({ message: 'Torrent download paused successfully.', torrentId });

    } catch (error) {
        console.error('Error pausing download:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
