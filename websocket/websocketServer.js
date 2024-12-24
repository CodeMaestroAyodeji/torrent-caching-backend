// websocket/websocketServer.js

const WebSocket = require('ws');
const url = require('url');
const clientManager = require('./clientManager');
const engineManager = require('./engineManager');

const initializeWebSocket = (server) => {
    const wss = new WebSocket.Server({ noServer: true });

    server.on('upgrade', (req, socket, head) => {
        const parsedUrl = url.parse(req.url, true);
        const userId = parsedUrl.query.userId;

        if (!userId) {
            console.error('WebSocket upgrade attempted without userId');
            socket.destroy();
            return;
        }

        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req);
        });
    });

    wss.on('connection', (ws, req) => {
        const parsedUrl = url.parse(req.url, true);
        const userId = parsedUrl.query.userId;

        if (userId) {
            clientManager.addClient(userId, ws);

            ws.on('close', () => {
                clientManager.removeClient(userId);
                engineManager.stopEngine(userId);
            });

            ws.on('error', (error) => {
                console.error(`WebSocket error for userId ${userId}:`, error);
                clientManager.removeClient(userId);
                engineManager.stopEngine(userId);
            });
        }
    });

    console.log('WebSocket server initialized');
};

module.exports = {
    initializeWebSocket,
    engineManager,
    clientManager,
};