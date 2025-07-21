import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { appEnvConfig } from '../../config'

const appConfig = appEnvConfig()

export const updateSession = async (request: NextRequest) => {
	// This `try/catch` block is only here for the interactive tutorial.
	// Feel free to remove once you have Supabase connected.
	try {
		// Create an unmodified response
		let response = NextResponse.next({
			request: {
				headers: request.headers,
			},
		})

		const supabase = createServerClient(
			appConfig.database.url,
			appConfig.database.anonKey,
			{
				cookies: {
					getAll() {
						return request.cookies.getAll()
					},
					setAll(cookiesToSet) {
						// biome-ignore lint/complexity/noForEach: <explanation>
						cookiesToSet.forEach(({ name, value }) =>
							request.cookies.set(name, value),
						)
						response = NextResponse.next({
							request,
						})
						// biome-ignore lint/complexity/noForEach: <explanation>
						cookiesToSet.forEach(({ name, value, options }) =>
							response.cookies.set(name, value, options),
						)
					},
				},
			},
		)

		// This will refresh session if expired - required for Server Components
		// https://supabase.com/docs/guides/auth/server-side/nextjs
		const user = await supabase.auth.getUser()

		if (
			!user &&
			!request.nextUrl.pathname.startsWith('/sign-in') &&
			!request.nextUrl.pathname.startsWith('/auth')
		) {
			// no user, potentially respond by redirecting the user to the login page
			const url = request.nextUrl.clone()
			url.pathname = '/sign-in'
			return NextResponse.redirect(url)
		}

		return response
	} catch (e) {
		// If you are here, a Supabase client could not be created!
		// This is likely because you have not set up environment variables.
		// Check out http://localhost:3000 for Next Steps.
		return NextResponse.next({
			request: {
				headers: request.headers,
			},
		})
	}
}
