import { validate as isUuid } from 'uuid';
import AppError from '../utils/appError.js';

const validateId = (req, res, next) => {
  const { id } = req.params;
  // console.log(id, req.params);

  if (!id) {
    const error = new AppError('No id passed', 400);
    error.statusCode = 400;
    error.status = 'fail';
    return next(error); // 👈 Pass error to your global handler
  }

  // Allow UUIDs or friendly identifiers (alphanumeric, hyphens, prefixes like ORD-)
  const isFriendlyId = /^[a-zA-Z0-9-]+$/.test(id);

  if (!isUuid(id) && !isFriendlyId) {
    const error = new AppError('Invalid ID or SKU format', 400);
    error.statusCode = 400;
    error.status = 'fail';
    return next(error);
  }

  next();
};

export default validateId;
