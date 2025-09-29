const { TransferStatus, UserStatus } = require('./status.enum');

const Constants = {
    INITIAL_POINTS: 500,
    TRANSFER_EXPIRY_MINUTES: 10,
    JWT_EXPIRY: '24h',
    PAGINATION: {
        DEFAULT_LIMIT: 10,
        DEFAULT_PAGE: 1
    }
};

module.exports = {
    Constants,
    TransferStatus,
    UserStatus
};