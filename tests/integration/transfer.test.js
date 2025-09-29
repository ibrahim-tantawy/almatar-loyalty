const request = require('supertest');
const App = require('../../src/app');
const { pool } = require('../../src/config/database');

describe('Transfer API', () => {
  let app;
  let senderToken;
  let recipientToken;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'almatar_loyalty_test';
    
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

    const senderResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sender User',
        email: 'sender@example.com',
        password: 'password123'
      });
    
    console.log('Sender registration:', senderResponse.body);
    
    if (senderResponse.body.data && senderResponse.body.data.token) {
      senderToken = senderResponse.body.data.token;
    } else {
      throw new Error('Sender registration failed: ' + JSON.stringify(senderResponse.body));
    }

    const recipientResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Recipient User',
        email: 'recipient@example.com',
        password: 'password123'
      });
    
    console.log('Recipient registration:', recipientResponse.body);
    
    if (recipientResponse.body.data && recipientResponse.body.data.token) {
      recipientToken = recipientResponse.body.data.token;
    } else {
      throw new Error('Recipient registration failed: ' + JSON.stringify(recipientResponse.body));
    }
  });

  describe('POST /api/transfers', () => {
    it('should create a transfer successfully', async () => {
      const transferData = {
        recipientEmail: 'recipient@example.com',
        points: 100
      };

      const response = await request(app)
        .post('/api/transfers')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(transferData);

      console.log('Transfer creation response:', response.body);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recipientEmail).toBe(transferData.recipientEmail);
      expect(response.body.data.points).toBe(transferData.points);
      expect(response.body.data.status).toBe('pending');
    });

    it('should fail with insufficient points', async () => {
      const transferData = {
        recipientEmail: 'recipient@example.com',
        points: 1000
      };

      const response = await request(app)
        .post('/api/transfers')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(transferData);

      console.log('Insufficient points response:', response.body);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Insufficient points');
    });
  });

  describe('POST /api/transfers/confirm', () => {
    it('should confirm a transfer successfully', async () => {
      const transferResponse = await request(app)
        .post('/api/transfers')
        .set('Authorization', `Bearer ${senderToken}`)
        .send({
          recipientEmail: 'recipient@example.com',
          points: 100
        });

      console.log('Transfer creation for confirmation:', transferResponse.body);

      const transferToken = transferResponse.body.data.token;

      const response = await request(app)
        .post('/api/transfers/confirm')
        .set('Authorization', `Bearer ${recipientToken}`)
        .send({ token: transferToken });

      console.log('Transfer confirmation response:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('confirmed');
    });
  });
});