import { validate as isUuid } from 'uuid';
import AppError from '../utils/appError.js';

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

export default validateId;
