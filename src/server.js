require('dotenv').config();
const App = require('./app');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    const appInstance = new App();
    await appInstance.initialize();

    const app = appInstance.getApp();

    app.listen(PORT, () => {
        console.log(`Almatar Loyalty API running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});