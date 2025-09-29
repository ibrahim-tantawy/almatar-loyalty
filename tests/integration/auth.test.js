const request = require('supertest');
const App = require('../../src/app');
const { pool, initializeDatabase } = require('../../src/config/database');

describe('Auth API', () => {
    let app;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.DB_NAME_TEST = 'almatar_loyalty_test';
        await initializeDatabase();
        const appInstance = new App();
        await appInstance.initialize();
        app = appInstance.getApp();
    }, 30000);

    afterAll(async () => {
        await pool.execute('DELETE FROM transfers');
        await pool.execute('DELETE FROM users');
        await pool.end();
    });

    beforeEach(async () => {
        await pool.execute('DELETE FROM transfers');
        await pool.execute('DELETE FROM users');
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            console.log('Registration response:', response.body);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toHaveProperty('id');
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.pointsBalance).toBe(500);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should fail with duplicate email', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            await request(app).post('/api/auth/register').send(userData);
            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            console.log('Duplicate registration response:', response.body);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        const userData = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };

        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send(userData);
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            console.log('Login response:', response.body);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe('test@example.com');
            expect(response.body.data).toHaveProperty('token');
        });

        it('should fail with invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            console.log('Invalid login response:', response.body);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toContain('Invalid credentials');
        });
    });
});