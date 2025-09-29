const pointsService = require('../services/points.service');
const { successResponse, errorResponse } = require('../utils/response');

class UserController {
    async getPoints(req, res) {
        try {
            const userId = req.user.userId;
            const points = await pointsService.getUserPoints(userId);
            successResponse(res, 'Points retrieved successfully', { points });
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }
}

module.exports = new UserController();