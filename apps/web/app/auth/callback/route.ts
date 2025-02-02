// app/auth/callback/route.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { AuthErrorHandler } from '~/lib/auth/error-handler'
import { Logger } from '~/lib/logger'
import { createClient } from '~/lib/supabase/server'
import { useAuthCallback } from '~/hooks/use-auth-callback'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const supabase = await createClient()
  
  const { success, redirectPath, error } = await useAuthCallback({
    code: requestUrl.searchParams.get('code'),
    redirectTo: requestUrl.searchParams.get('redirect_to'),
    logger: new Logger(),
    errorHandler: new AuthErrorHandler(new Logger()),
    supabase,
    defaultRedirect: '/dashboard',
  })

  const fullRedirectUrl = error
    ? `${requestUrl.origin}/sign-in?error=${encodeURIComponent(error)}`
    : `${requestUrl.origin}${redirectPath}`

  return NextResponse.redirect(fullRedirectUrl)
}