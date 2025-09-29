const transferService = require('../../src/services/transfer.service');

describe('Transfer Service', () => {
    describe('Method Existence', () => {
        it('should have getExpiredTransfers method', () => {
            expect(typeof transferService.getExpiredTransfers).toBe('function');
        });

        it('should have createTransfer method', () => {
            expect(typeof transferService.createTransfer).toBe('function');
        });

        it('should have confirmTransfer method', () => {
            expect(typeof transferService.confirmTransfer).toBe('function');
        });

        it('should have expireTransfer method', () => {
            expect(typeof transferService.expireTransfer).toBe('function');
        });

        it('should have getUserTransfers method', () => {
            expect(typeof transferService.getUserTransfers).toBe('function');
        });
    });
});