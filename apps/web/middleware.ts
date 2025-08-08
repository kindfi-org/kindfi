import { updateSession } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { type NextRequestWithAuth, withAuth } from 'next-auth/middleware'
import { ensureCsrfTokenCookie } from '~/app/actions/csrf'

// * Infer the type of the first parameter of updateSession
type ExpectedRequestType = Parameters<typeof updateSession>[0]

// Auth protected path prefixes / exact matches
const AUTH_PROTECTED_PATHS = ['/create-project', '/dashboard']

function isProtectedPath(pathname: string) {
	return (
		AUTH_PROTECTED_PATHS.includes(pathname) ||
		// /projects/[slug]/manage pattern
		(pathname.startsWith('/projects/') && pathname.endsWith('/manage'))
	)
}

export default withAuth(
	async function middleware(req: NextRequestWithAuth) {
		try {
			await ensureCsrfTokenCookie()

			// Redirect unauthenticated access to protected paths
			if (isProtectedPath(req.nextUrl.pathname) && !req.nextauth?.token) {
				const url = req.nextUrl.clone()
				url.pathname = '/sign-in'
				url.searchParams.set('callbackUrl', req.nextUrl.pathname)
				return NextResponse.redirect(url)
			}

			// Pass through Supabase session refresh logic
			return await updateSession(req as unknown as ExpectedRequestType, null)
		} catch (error) {
			console.error('Middleware error:', error)
			return NextResponse.next({
				request: { headers: req.headers },
			})
		}
	},
	{
		pages: {
			signIn: '/sign-in',
			signOut: '/sign-out',
			error: '/error',
		},
	},
)

export const config = {
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
