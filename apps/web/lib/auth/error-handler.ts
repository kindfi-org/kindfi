import type { AuthError } from '@supabase/supabase-js'
import type { Logger } from '~/lib/logger'
import { AuthErrorType, type AuthResponse } from '../types/auth'
import { ERROR_MESSAGES } from '../constants/error'

export class AuthErrorHandler {
  private logger: Logger

  constructor(logger: Logger) {
    this.logger = logger
  }

  handleAuthError(error: AuthError, action: string): AuthResponse {
    const errorType = this.mapSupabaseError(error)
    const message = ERROR_MESSAGES[errorType] || error.message

    this.logError(error, action, errorType)

    return {
      success: false,
      message,
      error: message,
    }
  }

  private mapSupabaseError(error: AuthError): AuthErrorType {
    const errorMessage = error.message.toLowerCase()
    const statusCode = error.status ?? 0

    // Handle rate limiting
    if (statusCode === 429) {
      return AuthErrorType.RATE_LIMIT_EXCEEDED
    }

    // Handle server errors
    if (statusCode >= 500) {
      return AuthErrorType.SERVER_ERROR
    }

    // Map specific error messages
    switch (true) {
      case errorMessage.includes('invalid login credentials'):
        return AuthErrorType.INVALID_CREDENTIALS
      case errorMessage.includes('email not confirmed'):
        return AuthErrorType.EMAIL_NOT_CONFIRMED
      case errorMessage.includes('invalid recovery token'):
      case errorMessage.includes('invalid reset token'):
        return AuthErrorType.INVALID_RESET_TOKEN
      case errorMessage.includes('password should be'):
      case errorMessage.includes('weak password'):
        return AuthErrorType.WEAK_PASSWORD
      case errorMessage.includes('user already registered'):
      case errorMessage.includes('email already registered'):
        return AuthErrorType.EMAIL_TAKEN
      case errorMessage.includes('expired'):
        return AuthErrorType.EXPIRED_CODE
      case errorMessage.includes('invalid code'):
        return AuthErrorType.INVALID_CODE
      case errorMessage.includes('no code'):
        return AuthErrorType.NO_CODE_PROVIDED
      case errorMessage.includes('session expired'):
        return AuthErrorType.SESSION_EXPIRED
      case statusCode === 401:
        return AuthErrorType.UNAUTHORIZED
      default:
        return AuthErrorType.SERVER_ERROR
    }
  }

  private logError(error: AuthError, action: string, errorType: AuthErrorType) {
    this.logger.error({
      eventType: 'AUTH_ERROR',
      errorType,
      action,
      errorCode: error.status ?? 500, 
      message: error.message,
      timestamp: new Date().toISOString(),
    })
  }
}