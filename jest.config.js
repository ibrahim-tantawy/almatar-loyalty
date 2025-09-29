module.exports = {
    testEnvironment: 'node',
    testTimeout: 30000,
    detectOpenHandles: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};