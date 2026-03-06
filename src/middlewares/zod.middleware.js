import AppError from '../utils/appError.js';

const validateZod = schema => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // ✅ Extract and group field errors
      const groupedErrors = result.error.issues.reduce((acc, issue) => {
        const field = issue.path.join('.') || 'general';
        if (!acc[field]) acc[field] = [];
        acc[field].push(issue.message);
        return acc;
      }, {});

      // ✅ Convert grouped errors into array format
      const errors = Object.entries(groupedErrors).map(([field, messages]) => ({
        field,
        messages
      }));

      return next(
        new AppError('Validation failed', 400, errors, 'VALIDATION_ERROR')
      );
    }

    req.validatedData = result.data;
    next();
  };
};

export default validateZod;
