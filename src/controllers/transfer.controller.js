const transferService = require('../services/transfer.service');
const { successResponse, errorResponse } = require('../utils/response');

class TransferController {
    async createTransfer(req, res) {
        try {
            const { recipientEmail, points } = req.body;
            const senderId = req.user.userId;

            const transfer = await transferService.createTransfer(senderId, recipientEmail, points);
            successResponse(res, 'Transfer created successfully', transfer, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    async confirmTransfer(req, res) {
        try {
            const { token } = req.body;
            const recipientId = req.user.userId;

            const transfer = await transferService.confirmTransfer(token, recipientId);
            successResponse(res, 'Transfer confirmed successfully', transfer);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    async getUserTransfers(req, res) {
        try {
            const userId = req.user.userId;
            const { page = 1, limit = 10 } = req.query;

            const result = await transferService.getUserTransfers(userId, page, limit);
            successResponse(res, 'Transfers retrieved successfully', result);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new TransferController();