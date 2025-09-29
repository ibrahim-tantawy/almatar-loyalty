const { initializeDatabase, testConnection } = require('../src/config/database');

const initDB = async () => {
    try {
        console.log('Initializing database...');
        await initializeDatabase();
        console.log('Database initialized successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
};

initDB();