const generateRandomString = (length = 32) => {
    return require('crypto').randomBytes(length).toString('hex');
};

module.exports = {
    generateRandomString
};