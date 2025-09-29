const express = require('express');
const transferController = require('../controllers/transfer.controller');
const { transferValidation, confirmTransferValidation } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', transferValidation, transferController.createTransfer);
router.post('/confirm', confirmTransferValidation, transferController.confirmTransfer);
router.get('/', transferController.getUserTransfers);

module.exports = router;