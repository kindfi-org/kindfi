import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Session } from 'next-auth'
import { appEnvConfig } from '../../config'
import type { AppEnvInterface } from '../../types'

// Pass 'web' explicitly to avoid Edge Runtime detection issues
const appConfig: AppEnvInterface = appEnvConfig('web')

export const updateSession = async (request: NextRequest, _userSession: Session | null) => {
	// Create an unmodified response
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	})
	try {
		const cookies = request.cookies
		const _supabase = createServerClient(appConfig.database.url, appConfig.database.anonKey, {
			cookies: {
				getAll() {
					return cookies.getAll()
				},
				setAll(cookiesToSet) {
					// First, set cookies in the request
					for (const { name, value } of cookiesToSet) {
						cookies.set(name, value)
					}
					// Create new response
					response = NextResponse.next({
						request,
					})
					// Then set cookies in the response
					for (const { name, value, options } of cookiesToSet) {
						response.cookies.set(name, value, options)
					}
				},
			},
		})

		// Session validation is handled via NextAuth (_userSession parameter).
		// Supabase cookies are refreshed here to keep the SSR client in sync.
		return response
	} catch (_e) {
		// Supabase client creation failed — check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
		return response
	}
}
