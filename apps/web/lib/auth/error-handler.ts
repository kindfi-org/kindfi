import { Logger } from '~/lib/logger'
import { AuthError } from '@supabase/supabase-js'
import type { AuthResponse } from './type'

enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  INVALID_CODE = 'INVALID_CODE',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_TAKEN = 'EMAIL_TAKEN',
  RATE_LIMITED = 'RATE_LIMITED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_RESET_TOKEN = 'INVALID_RESET_TOKEN'
}

const ERROR_MESSAGES = {
  [AuthErrorType.INVALID_CREDENTIALS]: 'Invalid email or password',
  [AuthErrorType.EMAIL_NOT_CONFIRMED]: 'Please check your email to confirm your account',
  [AuthErrorType.INVALID_CODE]: 'Invalid or expired authentication code',
  [AuthErrorType.PASSWORD_MISMATCH]: 'Passwords do not match',
  [AuthErrorType.WEAK_PASSWORD]: 'Password is too weak. It should be at least 8 characters long',
  [AuthErrorType.EMAIL_TAKEN]: 'An account with this email already exists',
  [AuthErrorType.RATE_LIMITED]: 'Too many attempts. Please try again later',
  [AuthErrorType.SESSION_EXPIRED]: 'Your session has expired. Please sign in again',
  [AuthErrorType.INVALID_RESET_TOKEN]: 'Password reset link is invalid or has expired'
}

export class AuthErrorHandler {
  private logger: Logger;
  
  constructor(logger: Logger) {
    this.logger = logger;
  }

  handleAuthError(error: AuthError, action: string): AuthResponse {
    const errorType = this.mapSupabaseError(error);
    const message = ERROR_MESSAGES[errorType] || error.message;
    
    this.logError(error, action, errorType);
    
    return {
      success: false,
      message,
      error: message
    };
  }

  private mapSupabaseError(error: AuthError): AuthErrorType {
    switch (error.message) {
      case 'Invalid login credentials':
        return AuthErrorType.INVALID_CREDENTIALS;
      case 'Email not confirmed':
        return AuthErrorType.EMAIL_NOT_CONFIRMED;
      case 'Invalid recovery token':
        return AuthErrorType.INVALID_RESET_TOKEN;
      case 'Password should be at least 8 characters':
        return AuthErrorType.WEAK_PASSWORD;
      case 'User already registered':
        return AuthErrorType.EMAIL_TAKEN;
      default:
        return AuthErrorType.INVALID_CREDENTIALS;
    }
  }

  private logError(error: AuthError, action: string, errorType: AuthErrorType) {
    this.logger.error({
      eventType: 'AUTH_ERROR',
      errorType,
      action,
      errorCode: error.status,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}