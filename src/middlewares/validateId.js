const { validate: isUuid } = require('uuid');
const AppError = require('../utils/appError');

const validateId = (req, res, next) => {
  const { id } = req.params;

  if (!isUuid(id)) {
    const error = new AppError('Invalid ID format', 400);
    error.statusCode = 400;
    error.status = 'fail';
    return next(error); // 👈 Pass error to your global handler
  }

  next();
};

module.exports = validateId;
