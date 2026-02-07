export const notFoundHandler = (_req, _res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({
    error: { message, code },
  });
};
