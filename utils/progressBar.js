// utils/progressBar.js

const cliProgress = require('cli-progress');

const createProgressBar = () => {
    return new cliProgress.SingleBar({
        format: 'Downloading |{bar}| {percentage}% || {value}/{total} Chunks',
        hideCursor: true
    }, cliProgress.Presets.shades_classic);
};

module.exports = {
    createProgressBar
};