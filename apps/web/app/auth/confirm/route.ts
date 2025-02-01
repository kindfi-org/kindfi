// app/auth/confirm/route.ts
import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '~/lib/supabase/server'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { Logger } from '~/lib/logger'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  try {
    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      })

      if (error) {
        const errorResponse = errorHandler.handleAuthError(error, 'verify_otp')
        logger.error({
          eventType: 'OTP_VERIFICATION_FAILED',
          ...errorResponse,
          tokenHash,
          type,
          timestamp: new Date().toISOString()
        })

        return NextResponse.redirect(
          `${requestUrl.origin}/sign-in?error=${encodeURIComponent(errorResponse.message)}`
        )
      }

      logger.info({
        eventType: 'OTP_VERIFICATION_SUCCESS',
        type,
        next,
        timestamp: new Date().toISOString()
      })

      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }

    // No token_hash or type provided
    logger.warn({
      eventType: 'INVALID_OTP_PARAMETERS',
      tokenHash,
      type,
      timestamp: new Date().toISOString()
    })

    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${encodeURIComponent('Invalid verification parameters')}`
    )
  } catch (error: any) {
    // Log unexpected errors
    logger.error({
      eventType: 'OTP_VERIFICATION_ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    })

    // Redirect to sign-in with generic error message
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${encodeURIComponent('An unexpected error occurred during verification')}`
    )
  }
}