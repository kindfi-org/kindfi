import type { AuthResponse } from './type'

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_CONFIRMED: 'Please check your email to confirm your account',
  INVALID_CODE: 'Invalid or expired authentication code',
  PASSWORD_MISMATCH: 'Passwords do not match',
  WEAK_PASSWORD: 'Password is too weak. It should be at least 8 characters long',
  EMAIL_TAKEN: 'An account with this email already exists',
  RATE_LIMITED: 'Too many attempts. Please try again later',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',
  INVALID_RESET_TOKEN: 'Password reset link is invalid or has expired'
}

export function handleClientAuthError(error: any): AuthResponse {
  const message = ERROR_MESSAGES[error.type as keyof typeof ERROR_MESSAGES] || error.message;
  
  console.error('[Auth Error]', {
    eventType: 'AUTH_ERROR',
    errorType: error.type,
    action: 'client_side_auth',
    message: error.message,
    timestamp: new Date().toISOString()
  });
  
  return {
    success: false,
    message,
    error: message
  };
}