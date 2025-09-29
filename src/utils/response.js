const successResponse = (res, message, data = null, statusCode = 200) => {
    const response = {
        success: true,
        message,
        data
    };

    return res.status(statusCode).json(response);
};

const errorResponse = (res, error, statusCode = 500) => {
    const response = {
        success: false,
        error: error.message || error
    };

    return res.status(statusCode).json(response);
};

module.exports = {
    successResponse,
    errorResponse
};