const crypto = require('crypto');
const transferRepository = require('../repositories/transfer.repository');
const userRepository = require('../repositories/user.repository');
const pointsService = require('./points.service');
const { TransferStatus, Constants } = require('../constants');

class TransferService {
    async createTransfer(senderId, recipientEmail, points) {
        await pointsService.validatePointsBalance(senderId, points);

        const recipient = await userRepository.findByEmail(recipientEmail);
        if (!recipient) {
            throw new Error('Recipient not found');
        }

        if (recipient.id === senderId) {
            throw new Error('Cannot transfer points to yourself');
        }

        const token = this.generateToken();
        const expiresAt = new Date(Date.now() + Constants.TRANSFER_EXPIRY_MINUTES * 60 * 1000);
        const transfer = await transferRepository.create({
            senderId,
            recipientEmail,
            points,
            token,
            expiresAt
        });

        await userRepository.updatePointsAtomic(senderId, -points);
        return transfer;
    }

    async confirmTransfer(token, recipientId) {
        const transfer = await transferRepository.findByToken(token);

        if (!transfer) {
            throw new Error('Transfer not found');
        }

        if (transfer.status !== TransferStatus.PENDING) {
            throw new Error(`Transfer already ${transfer.status}`);
        }

        if (new Date(transfer.expiresAt) < new Date()) {
            await this.expireTransfer(transfer.id);
            throw new Error('Transfer has expired');
        }

        const recipient = await userRepository.findById(recipientId);
        if (transfer.recipientEmail !== recipient.email) {
            throw new Error('You are not the intended recipient of this transfer');
        }

        await userRepository.updatePointsAtomic(recipientId, transfer.points);
        const confirmedTransfer = await transferRepository.updateStatus(
            transfer.id,
            TransferStatus.CONFIRMED,
            recipientId
        );

        return confirmedTransfer;
    }

    async expireTransfer(transferId) {
        const transfer = await transferRepository.findById(transferId);

        if (transfer && transfer.status === TransferStatus.PENDING) {
            await userRepository.updatePointsAtomic(transfer.senderId, transfer.points);
            await transferRepository.updateStatus(transferId, TransferStatus.EXPIRED);
        }
    }

    async getExpiredTransfers() {
        return await transferRepository.findExpiredTransfers();
    }

    async getUserTransfers(userId, page, limit) {
        const transfers = await transferRepository.findByUserId(userId, page, limit);
        const total = await transferRepository.countByUserId(userId);

        return {
            transfers: transfers.map(t => t.toJSON()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    generateToken() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = new TransferService();