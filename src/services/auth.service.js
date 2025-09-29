const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { Constants } = require('../constants');
const logger = require('../utils/logger');

class AuthService {
    async register(userData) {
        try {
            const { name, email, password } = userData;

            logger.info(`Attempting to register user: ${email}`);

            const existingUser = await userRepository.findByEmail(email);
            if (existingUser) {
                logger.warn(`Registration failed: User already exists with email ${email}`);
                throw new Error('User already exists with this email');
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await userRepository.create({
                name,
                email,
                password: hashedPassword,
                pointsBalance: Constants.INITIAL_POINTS
            });

            const token = this.generateToken(user);

            logger.info(`User registered successfully: ${email}`);

            return {
                user: user.toJSON(),
                token
            };
        } catch (error) {
            logger.error(`Registration error for ${userData.email}:`, error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            const { email, password } = credentials;

            logger.info(`Attempting login for: ${email}`);

            const user = await userRepository.findByEmail(email);
            if (!user) {
                logger.warn(`Login failed: User not found for email ${email}`);
                throw new Error('Invalid credentials');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                logger.warn(`Login failed: Invalid password for email ${email}`);
                throw new Error('Invalid credentials');
            }

            const token = this.generateToken(user);

            logger.info(`Login successful for: ${email}`);

            return {
                user: user.toJSON(),
                token
            };
        } catch (error) {
            logger.error(`Login error for ${credentials.email}:`, error);
            throw error;
        }
    }

    generateToken(user) {
        return jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: Constants.JWT_EXPIRY }
        );
    }

    verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    }
}

module.exports = new AuthService();