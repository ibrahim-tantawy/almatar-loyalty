const userRepository = require('../repositories/user.repository');

class PointsService {
    async getUserPoints(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user.pointsBalance;
    }

    async hasSufficientPoints(userId, requiredPoints) {
        const currentPoints = await this.getUserPoints(userId);
        return currentPoints >= requiredPoints;
    }

    async validatePointsBalance(userId, pointsToDeduct) {
        if (pointsToDeduct <= 0) {
            throw new Error('Points must be positive');
        }

        const hasPoints = await this.hasSufficientPoints(userId, pointsToDeduct);
        if (!hasPoints) {
            throw new Error('Insufficient points');
        }

        return true;
    }
}

module.exports = new PointsService();