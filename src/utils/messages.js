export default {
  // General
  success: 'success',
  error: 'error',
  notDefined: 'Value not defined.',
  notFound: 'Requested resource not found.',
  invalidData: 'Invalid data provided. Please review your input and try again.',
  duplicateEntry: 'This record already exists.',
  dbError: 'Database connection failed. Please try again later.',
  serverError: 'Server error. Please try again shortly.',
  networkError: 'Network issue detected. Check your connection and retry.',

  // Bricks
  brickCreated: 'Brick created successfully.',
  brickUpdated: 'Brick updated successfully.',
  brickDeleted: 'Brick deleted successfully.',
  brickNotFound: 'No brick found with the provided information.',
  brickAvailable: 'Brick slot is available for booking.',

  // Bookings
  bookingCreated: 'Booking created successfully.',
  bookingUpdated: 'Booking updated successfully.',
  bookingDeleted: 'Booking deleted successfully.',
  bookingNotFound: 'No booking found with the provided information.',

  // Authentication
  loggedIn: 'Login successful. Welcome back!',
  loggedOut: 'You have been logged out successfully.',
  notAuthenticated: 'You must be logged in to access this resource.',
  unAuthorized: 'You do not have permission to perform this action.',

  // Email
  emailRequired: 'Email address is required.',
  emailInUse: 'This email is already associated with another account.',
  emailNotSent: 'Unable to send email. Please try again later.',
  invalidEmail: 'Please provide a valid email address.',
  resetTokenSent: 'Password reset token sent to email successfully',

  // User Management
  userCreated: 'User account created successfully.',
  userUpdated: 'User information updated successfully.',
  userDeleted: 'User account deleted successfully.',
  userNotFound: 'No user found with the provided information.',
  userPromoted: 'Admin promoted to Owner successfully.',

  // Passwords
  incorrectPassword: 'Incorrect password. Please try again.',
  passwordRequired: 'Password is required.',
  passwordWeak: 'Password must be at least 6 characters long.',
  passwordUpdated: 'Password updated successfully.',
  passwordResetSuccess: 'Password reset successfully. Please log in again.',
  passwordRecentlyChanged: 'Password was changed recently. Please log in again.',
  newPasswordSame: 'New password cannot be the same as the current password.',

  // Tokens
  invalidToken: 'Invalid or expired authentication token.',

  // Actions & Validation
  actionFailed: 'Unable to complete this action. Please try again.',
  actionSuccess: 'Action completed successfully.',
  invalidInput: 'Some fields contain invalid data.',
  missingFields: 'Please fill in all required fields.',
  invalidCredentials: 'Invalid email or password.',
  recordNotFound: 'No matching record found.',
  fieldRequired: 'This field is required.',

  // Admin & System
  adminCreated: 'New admin account created successfully.',
  adminRemoved: 'Admin account removed successfully.',
  roleUpdated: 'User role updated successfully.',
  accessRevoked: 'Access revoked successfully.',

  // Account Management
  accountCreated: 'Account created successfully.',
  accountUpdated: 'Account details updated successfully.',
  accountDeleted: 'Account deleted successfully.',
  accountDisabled: 'Your account has been disabled. Contact support.',

  // Miscellaneous
  tryAgainLater: 'Something went wrong. Please try again later.',
  invalidRequest: 'Invalid request. Please verify your input.',
  operationInProgress: 'Operation in progress. Please wait...',
  resourceConflict: 'A similar resource already exists.',
};
