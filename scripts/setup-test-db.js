const mysql = require('mysql2/promise');
const { initializeDatabase } = require('../src/config/database');

const setupTestDB = async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME_TEST = 'almatar_loyalty_test';

    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    try {
        console.log('=== Setting up Test Database ===');

        console.log('1. Dropping test database...');
        await connection.execute('DROP DATABASE IF EXISTS almatar_loyalty_test');

        console.log('2. Creating test database...');
        await connection.execute('CREATE DATABASE almatar_loyalty_test');

        console.log('3. Initializing database schema...');
        await initializeDatabase();

        console.log('=== Test Database Setup Complete ===');
    } catch (error) {
        console.error('Error setting up test database:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
};

setupTestDB();