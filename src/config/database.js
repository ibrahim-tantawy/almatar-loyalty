const mysql = require('mysql2/promise');
require('dotenv').config();

const getDatabaseName = () => {
    if (process.env.NODE_ENV === 'test') {
        return process.env.DB_NAME_TEST || 'almatar_loyalty_test';
    }
    return process.env.DB_NAME || 'almatar_loyalty';
};

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: getDatabaseName(),
    connectionLimit: 10
};

console.log(`Using database: ${dbConfig.database} in ${process.env.NODE_ENV || 'development'} environment`);

const pool = mysql.createPool(dbConfig);

const initializeDatabase = async () => {
    try {
        console.log('Starting database initialization...');

        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
        console.log(`Database ${dbConfig.database} ensured`);
        await connection.end();

        await createTables();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
};

const createTables = async () => {
    const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      points_balance INT DEFAULT 0,
      status ENUM('active', 'inactive') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email (email),
      INDEX idx_status (status)
    )
  `;

    const createTransfersTable = `
    CREATE TABLE IF NOT EXISTS transfers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      recipient_email VARCHAR(255) NOT NULL,
      recipient_id INT NULL,
      points INT NOT NULL,
      status ENUM('pending', 'confirmed', 'expired', 'cancelled') DEFAULT 'pending',
      token VARCHAR(255) UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      confirmed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
      INDEX idx_sender_id (sender_id),
      INDEX idx_recipient_email (recipient_email),
      INDEX idx_status (status),
      INDEX idx_expires_at (expires_at)
    )
  `;

    const connection = await pool.getConnection();
    try {
        console.log('Creating users table...');
        await connection.execute(createUsersTable);
        console.log('Users table created successfully');

        console.log('Creating transfers table...');
        await connection.execute(createTransfersTable);
        console.log('Transfers table created successfully');

        await verifyTables(connection);
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    } finally {
        connection.release();
    }
};

const verifyTables = async (connection) => {
    try {
        const [userColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbConfig.database]);

        const userColumnNames = userColumns.map(col => col.COLUMN_NAME);
        console.log('Users table columns:', userColumnNames);

        const [transferColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'transfers'
    `, [dbConfig.database]);

        const transferColumnNames = transferColumns.map(col => col.COLUMN_NAME);
        console.log('Transfers table columns:', transferColumnNames);

    } catch (error) {
        console.error('Error verifying tables:', error);
    }
};

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
};

module.exports = {
    pool,
    initializeDatabase,
    testConnection,
    getDatabaseName
};