import crypto from 'crypto';

export const SentenseCase = word => {
  const lowerCase = word.toLowerCase();
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
};

export const cleanUser = user => {
  if (!user) return null;

  const {
    password,
    passwordChangedAt,
    passwordResetToken,
    passwordResetExpires,
    ...safeUser
  } = user;
  return safeUser;
};

export const cleanProduct = product => {
  if (!product) return null;

  const { userId, createdAt, updatedAt, ...cleanProduct } = product;
  return cleanProduct;
};

export const createPasswordResetToken = user => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  return { resetToken, passwordResetToken, passwordResetExpires };
};
