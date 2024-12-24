const WebSocket = require('ws');
const Torrent = require('../../../models/Torrent');
const { clients, stopTorrentEngine } = require('../../../websocket/websocketServer');

exports.cancelDownload = async (req, res) => {
    const { torrentId } = req.body;

    try {
        // Find the torrent in the database
        const torrent = await Torrent.findById(torrentId);
        
        if (!torrent) {
            return res.status(404).json({ error: 'Torrent not found.' });
        }

        // Stop the torrent engine based on userId
        stopTorrentEngine(torrent.user.toString()); // Call the function to stop the torrent engine

        // Update the status of the torrent to 'cancelled' instead of deleting it
        torrent.status = 'cancelled';
        await torrent.save(); // Save changes to the database

        // Notify the user via WebSocket
        const ws = clients.get(torrent.user.toString());
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ torrentId, event: 'cancelled' }));
        }

        res.status(200).json({ message: 'Torrent download cancelled successfully.', torrentId });

    } catch (error) {
        console.error('Error cancelling download:', error);
        res.status(500).json({ error: error.message });
    }
};

