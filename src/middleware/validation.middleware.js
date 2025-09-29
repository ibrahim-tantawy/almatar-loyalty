const Joi = require('joi');
const { errorResponse } = require('../utils/response');

const registerValidation = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    validateRequest(req, res, next, schema);
};

const loginValidation = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    validateRequest(req, res, next, schema);
};

const transferValidation = (req, res, next) => {
    const schema = Joi.object({
        recipientEmail: Joi.string().email().required(),
        points: Joi.number().integer().min(1).required()
    });

    validateRequest(req, res, next, schema);
};

const confirmTransferValidation = (req, res, next) => {
    const schema = Joi.object({
        token: Joi.string().required()
    });

    validateRequest(req, res, next, schema);
};

const validateRequest = (req, res, next, schema) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return errorResponse(res, error.details[0].message, 400);
    }
    next();
};

module.exports = {
    registerValidation,
    loginValidation,
    transferValidation,
    confirmTransferValidation
};