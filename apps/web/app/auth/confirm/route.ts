// app/auth/confirm/route.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { useAuthCallback } from '~/hooks/use-auth-callback'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { Logger } from '~/lib/logger'
import { createClient } from '~/lib/supabase/server'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  const { success, redirectPath, error } = await useAuthCallback({
    code: tokenHash,
    redirectTo: next,
    logger,
    errorHandler,
    supabase,
    onError: (errMsg) => {
      logger.error({
        eventType: 'OTP_VERIFICATION_FAILED',
        error: errMsg,
        tokenHash,
        type,
        timestamp: new Date().toISOString(),
      })
    }
  })

  if (!success) {
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${encodeURIComponent(error || 'An unexpected error occurred')}`
    )
  }

  logger.info({
    eventType: 'OTP_VERIFICATION_SUCCESS',
    type,
    next,
    timestamp: new Date().toISOString(),
  })

  return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
}
