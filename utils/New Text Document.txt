/**
 * Calculates total size from an array of files
 * @param {Array} files - Array of files with formattedSize property
 * @returns {string} - Total formatted size
 */
const calculateTotalSize = (files) => {
    const sizeUnits = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024
    };

    const totalBytes = files.reduce((acc, file) => {
        if (!file.formattedSize) return acc;
        
        const [size, unit] = file.formattedSize.match(/[\d.]+|\D+/g);
        return acc + (parseFloat(size) * sizeUnits[unit.toUpperCase()]);
    }, 0);

    // Convert back to formatted size
    if (totalBytes >= sizeUnits.GB) {
        return `${(totalBytes / sizeUnits.GB).toFixed(2)}GB`;
    } else if (totalBytes >= sizeUnits.MB) {
        return `${(totalBytes / sizeUnits.MB).toFixed(2)}MB`;
    } else if (totalBytes >= sizeUnits.KB) {
        return `${(totalBytes / sizeUnits.KB).toFixed(2)}KB`;
    }
    return `${totalBytes.toFixed(2)}B`;
};

module.exports = {
    calculateTotalSize
};