// services/webSocketManager.js

const WebSocket = require('ws');
let wss;

class WebSocketManager {
    static initialize(server) {
        wss = new WebSocket.Server({ server });
        
        wss.on('connection', (ws, req) => {
            const userId = req.url.split('=')[1];
            ws.userId = userId;
        });
    }

    static broadcastToUser(userId, data) {
        if (!wss) return;
        
        wss.clients.forEach(client => {
            if (client.userId === userId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

module.exports = WebSocketManager;