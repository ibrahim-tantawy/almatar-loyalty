const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeDatabase } = require('./config/database');
const transferService = require('./services/transfer.service');
const nodeCron = require('node-cron');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const transferRoutes = require('./routes/transfer.routes');
const userRoutes = require('./routes/user.routes');

class App {
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupCronJobs();
    }

    setupMiddleware() {
        this.app.use(helmet());
        this.app.use(cors());

        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        this.app.use(limiter);

        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/transfers', transferRoutes);
        this.app.use('/api/users', userRoutes);

        this.app.get('/health', (req, res) => {
            res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
        });

        this.app.use('*', (req, res) => {
            res.status(404).json({ error: 'Route not found' });
        });

        this.app.use((error, req, res, next) => {
            logger.error('Unhandled error:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
    }

    setupCronJobs() {
        if (process.env.NODE_ENV === 'test') {
            logger.info('Cron jobs disabled in test environment');
            return;
        }

        nodeCron.schedule('* * * * *', async () => {
            try {
                logger.info('Checking for expired transfers...');

                if (typeof transferService.getExpiredTransfers !== 'function') {
                    logger.error('getExpiredTransfers method not found on transferService');
                    return;
                }

                const expiredTransfers = await transferService.getExpiredTransfers();

                for (const transfer of expiredTransfers) {
                    try {
                        await transferService.expireTransfer(transfer.id);
                        logger.info(`Expired transfer ${transfer.id}`);
                    } catch (error) {
                        logger.error(`Error expiring transfer ${transfer.id}:`, error);
                    }
                }

                if (expiredTransfers.length > 0) {
                    logger.info(`Expired ${expiredTransfers.length} transfers`);
                }
            } catch (error) {
                logger.error('Error in transfer expiration cron job:', error);
            }
        });

        logger.info('Cron jobs initialized');
    }

    async initialize() {
        try {
            await initializeDatabase();
            logger.info('Application initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize application:', error);
            process.exit(1);
        }
    }

    getApp() {
        return this.app;
    }
}

module.exports = App;