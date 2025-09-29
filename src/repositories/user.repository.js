const { pool } = require('../config/database');
const User = require('../models/user.model');
const { UserStatus } = require('../constants');

class UserRepository {
    async create(userData) {
        const { name, email, password, pointsBalance = 0 } = userData;
        const query = `
      INSERT INTO users (name, email, password, points_balance, status) 
      VALUES (?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            name,
            email,
            password,
            pointsBalance,
            UserStatus.ACTIVE
        ]);

        return this.findById(result.insertId);
    }

    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows.length ? this.mapToUser(rows[0]) : null;
    }

    async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows.length ? this.mapToUser(rows[0]) : null;
    }

    async updatePoints(userId, newBalance) {
        const query = 'UPDATE users SET points_balance = ? WHERE id = ?';
        await pool.execute(query, [newBalance, userId]);

        return this.findById(userId);
    }

    async updatePointsAtomic(userId, pointsChange) {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            const [rows] = await connection.execute(
                'SELECT points_balance FROM users WHERE id = ? FOR UPDATE',
                [userId]
            );

            if (!rows.length) {
                throw new Error('User not found');
            }

            const currentBalance = rows[0].points_balance;
            const newBalance = currentBalance + pointsChange;

            if (newBalance < 0) {
                throw new Error('Insufficient points');
            }

            await connection.execute(
                'UPDATE users SET points_balance = ? WHERE id = ?',
                [newBalance, userId]
            );

            await connection.commit();
            return newBalance;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    mapToUser(row) {
        return new User(
            row.id,
            row.name,
            row.email,
            row.password,
            row.points_balance,
            row.status,
            row.created_at,
            row.updated_at
        );
    }
}

module.exports = new UserRepository();