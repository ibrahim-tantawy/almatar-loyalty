const { pool } = require('../config/database');
const Transfer = require('../models/transfer.model');
const { TransferStatus } = require('../constants');

class TransferRepository {
    async create(transferData) {
        const { senderId, recipientEmail, points, token, expiresAt } = transferData;
        const query = `
      INSERT INTO transfers (sender_id, recipient_email, points, token, expires_at, status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;

        const [result] = await pool.execute(query, [
            senderId,
            recipientEmail,
            points,
            token,
            expiresAt,
            TransferStatus.PENDING
        ]);

        return this.findById(result.insertId);
    }

    async findById(id) {
        const query = 'SELECT * FROM transfers WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows.length ? this.mapToTransfer(rows[0]) : null;
    }

    async findByToken(token) {
        const query = 'SELECT * FROM transfers WHERE token = ?';
        const [rows] = await pool.execute(query, [token]);
        return rows.length ? this.mapToTransfer(rows[0]) : null;
    }

    async updateStatus(id, status, recipientId = null) {
        const query = `
      UPDATE transfers 
      SET status = ?, recipient_id = ?, confirmed_at = ? 
      WHERE id = ?
    `;

        const confirmedAt = status === TransferStatus.CONFIRMED ? new Date() : null;

        await pool.execute(query, [
            status,
            recipientId,
            confirmedAt,
            id
        ]);

        return this.findById(id);
    }

    async findExpiredTransfers() {
        const query = 'SELECT * FROM transfers WHERE status = ? AND expires_at < NOW()';
        const [rows] = await pool.execute(query, [TransferStatus.PENDING]);
        return rows.map(row => this.mapToTransfer(row));
    }

    async findByUserId(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const query = `
      SELECT * FROM transfers 
      WHERE (sender_id = ? OR recipient_id = ?) 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

        const [rows] = await pool.execute(query, [userId, userId, limit, offset]);
        return rows.map(row => this.mapToTransfer(row));
    }

    async countByUserId(userId) {
        const query = 'SELECT COUNT(*) as count FROM transfers WHERE sender_id = ? OR recipient_id = ?';
        const [rows] = await pool.execute(query, [userId, userId]);
        return rows[0].count;
    }

    mapToTransfer(row) {
        return new Transfer(
            row.id,
            row.sender_id,
            row.recipient_email,
            row.recipient_id,
            row.points,
            row.status,
            row.token,
            row.expires_at,
            row.confirmed_at,
            row.created_at,
            row.updated_at
        );
    }
}

module.exports = new TransferRepository();