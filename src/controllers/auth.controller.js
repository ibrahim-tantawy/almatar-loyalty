const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

class AuthController {
    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            successResponse(res, 'User registered successfully', result, 201);
        } catch (error) {
            errorResponse(res, error.message, 400);
        }
    }

    async login(req, res) {
        try {
            const result = await authService.login(req.body);
            successResponse(res, 'Login successful', result);
        } catch (error) {
            errorResponse(res, error.message, 401);
        }
    }
}

module.exports = new AuthController();