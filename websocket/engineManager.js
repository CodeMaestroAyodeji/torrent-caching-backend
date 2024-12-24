// websocket/engineManager.js

const torrentStream = require('torrent-stream');

class EngineManager {
    constructor() {
        this.activeEngines = new Map();
    }

    startEngine(userId, magnetLink) {
        const engine = torrentStream(magnetLink);
        this.activeEngines.set(userId, engine);
        return engine;
    }

    stopEngine(userId) {
        const engine = this.activeEngines.get(userId);
        if (engine) {
            engine.destroy();
            this.activeEngines.delete(userId);
        }
    }

    getEngine(userId) {
        return this.activeEngines.get(userId);
    }
}

module.exports = new EngineManager();