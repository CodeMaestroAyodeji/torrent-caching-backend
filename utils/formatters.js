// utils/formatters.js
const formatFileSize = (sizeInBytes) => {
    const size = parseFloat(sizeInBytes);
    if (size >= 1073741824) { // GB
        return `${(size / 1073741824).toFixed(2)}GB`;
    } else if (size >= 1048576) { // MB
        return `${(size / 1048576).toFixed(2)}MB`;
    } else if (size >= 1024) { // KB
        return `${(size / 1024).toFixed(2)}KB`;
    }
    return `${size.toFixed(2)}B`;
};

module.exports = {
    formatFileSize
};
