const { initializeDatabase, testConnection, pool, getDatabaseName } = require('../../src/config/database');

describe('Database', () => {
    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.DB_NAME_TEST = 'almatar_loyalty_test';
        await initializeDatabase();
    });

    afterAll(async () => {
        await pool.end();
    });

    it('should initialize database successfully', async () => {
        await expect(initializeDatabase()).resolves.not.toThrow();
    });

    it('should have users table with correct columns', async () => {
        const databaseName = getDatabaseName();
        console.log(`Checking users table in database: ${databaseName}`);

        const [rows] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
      ORDER BY COLUMN_NAME
    `, [databaseName]);

        console.log('Found columns:', rows.map(r => r.COLUMN_NAME));

        const columnNames = rows.map(row => row.COLUMN_NAME);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('name');
        expect(columnNames).toContain('email');
        expect(columnNames).toContain('password');
        expect(columnNames).toContain('points_balance');
        expect(columnNames).toContain('status');
    });

    it('should have transfers table with correct columns', async () => {
        const databaseName = getDatabaseName();
        console.log(`Checking transfers table in database: ${databaseName}`);

        const [rows] = await pool.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'transfers'
      ORDER BY COLUMN_NAME
    `, [databaseName]);

        console.log('Found columns:', rows.map(r => r.COLUMN_NAME));

        const columnNames = rows.map(row => row.COLUMN_NAME);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('sender_id');
        expect(columnNames).toContain('recipient_email');
        expect(columnNames).toContain('points');
        expect(columnNames).toContain('status');
        expect(columnNames).toContain('token');
    });

    it('should be able to insert and read from users table', async () => {
        const [insertResult] = await pool.execute(
            'INSERT INTO users (name, email, password, points_balance) VALUES (?, ?, ?, ?)',
            ['Test User', 'test@example.com', 'hashedpassword', 500]
        );

        expect(insertResult.insertId).toBeGreaterThan(0);

        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', ['test@example.com']);
        expect(users).toHaveLength(1);
        expect(users[0].name).toBe('Test User');
        expect(users[0].points_balance).toBe(500);

        await pool.execute('DELETE FROM users WHERE email = ?', ['test@example.com']);
    });
});