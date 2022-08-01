function getFileExtension(fileName) {
    return fileName.split('.').pop();
}

module.exports = {
    getFileExtension,
};
