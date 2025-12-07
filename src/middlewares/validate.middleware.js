import AppError from '../utils/appError.js';

const validate = (schema) => async (req, res, next) => {
  try {
    const validatedData = await schema.parseAsync(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    const errors = error.errors.map((err) => err.message).join(', ');
    next(new AppError(`Validation Error: ${errors}`, 400));
  }
};

export default validate;
