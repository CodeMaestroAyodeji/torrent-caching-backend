// websocket/clientManager.js

const WebSocket = require('ws');

class ClientManager {
    constructor() {
        this.clients = new Map();
    }

    addClient(userId, ws) {
        console.log(`New WebSocket connection for userId: ${userId}`);
        this.clients.set(userId, ws);
    }

    removeClient(userId) {
        console.log(`Client disconnected: ${userId}`);
        this.clients.delete(userId);
    }

    getClient(userId) {
        return this.clients.get(userId);
    }

    isClientConnected(userId) {
        const ws = this.getClient(userId);
        return ws && ws.readyState === WebSocket.OPEN;
    }
}

module.exports = new ClientManager();