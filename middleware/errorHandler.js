const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Check if headers have already been sent
    if (res.headersSent) {
        return next(err);
    }

    // Default error status and message
    const status = err.status || 500;
    const message = err.message || 'Something went wrong!';

    // Development error response (includes stack trace)
    if (process.env.NODE_ENV === 'development') {
        return res.status(status).json({
            error: {
                message,
                stack: err.stack
            }
        });
    }

    // Production error response (no stack trace)
    res.status(status).json({
        error: {
            message: status === 500 ? 'Internal Server Error' : message
        }
    });
};

module.exports = errorHandler; 