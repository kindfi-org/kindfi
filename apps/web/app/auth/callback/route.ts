import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '~/lib/supabase/server'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { Logger } from '~/lib/logger'

const logger = new Logger()
const errorHandler = new AuthErrorHandler(logger)

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirect_to')
  const supabase = await createClient()

  try {
    if (code) {
      const { error, data } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        logger.error({
          eventType: 'AUTH_CALLBACK_ERROR',
          error: error.message,
          code: error.status,
          timestamp: new Date().toISOString()
        })

        return NextResponse.redirect(
          `${requestUrl.origin}/sign-in?error=${encodeURIComponent('Authentication failed')}`
        )
      }

      if (redirectTo) {
        return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
      }
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    }

    logger.warn({
      eventType: 'AUTH_CALLBACK_ERROR',
      error: 'No code provided',
      timestamp: new Date().toISOString()
    })

    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${encodeURIComponent('Invalid authentication request')}`
    )
  } catch (error: any) {
    logger.error({
      eventType: 'AUTH_CALLBACK_ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    })
    return NextResponse.redirect(
      `${requestUrl.origin}/sign-in?error=${encodeURIComponent('An unexpected error occurred')}`
    )
  }
}
