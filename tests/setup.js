const { pool, initializeDatabase } = require('../src/config/database');

module.exports = async () => {
    try {
        await initializeDatabase();
        console.log('Test database initialized');
    } catch (error) {
        console.error('Test database initialization failed:', error);
        throw error;
    }
};