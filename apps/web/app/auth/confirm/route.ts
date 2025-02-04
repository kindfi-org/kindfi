import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { useAuthErrorHandler } from '~/hooks/use-auth-error-handler'
import { createClient } from '~/lib/supabase/server'



export async function GET(request: NextRequest) {
const { logger, errorHandler } = useAuthErrorHandler()	
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  logger.info({
    eventType: 'EMAIL_VERIFICATION_REQUEST',
    hasToken: !!tokenHash,
    type,
  })

  if (tokenHash && type) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      })

      if (error) {
        const response = errorHandler.handleAuthError(error, 'verifyOtp')
        
        logger.error({
          eventType: 'OTP_VERIFICATION_ERROR',
          errorMessage: response.error,
          type,
        })

        // Add error to the redirect URL
        const errorUrl = new URL('/error', request.url)
        errorUrl.searchParams.set('reason', 'verification_failed')
        errorUrl.searchParams.set('error', response.error ?? 'unknown_error')
        redirect(errorUrl.toString())
      }

      logger.info({
        eventType: 'OTP_VERIFICATION_SUCCESS',
        type,
      })

      redirect(next)
    } catch (error) {
      logger.error({
        eventType: 'UNEXPECTED_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      redirect('/error?reason=unexpected_error')
    }
  }

  logger.warn({
    eventType: 'INVALID_VERIFICATION_REQUEST',
    hasToken: !!tokenHash,
    hasType: !!type,
  })

  redirect('/error?reason=missing_parameters')
}