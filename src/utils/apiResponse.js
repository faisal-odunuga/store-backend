const apiResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
    message,
    data
  });
};

export default apiResponse;
