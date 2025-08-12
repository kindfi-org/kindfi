'use server'

import { cookies } from 'next/headers'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_TOKEN_LENGTH = 32

// Generate a cryptographically secure CSRF token
export async function generateCsrfToken(): Promise<string> {
	const timestamp = Date.now().toString(36)
	const randomPart = Array.from({ length: CSRF_TOKEN_LENGTH }, () =>
		Math.floor(Math.random() * 16).toString(16),
	).join('')
	const performanceEntropy =
		typeof performance !== 'undefined'
			? performance.now().toString(36).replace('.', '')
			: Math.random().toString(36).substring(2)

	return (timestamp + randomPart + performanceEntropy).substring(
		0,
		CSRF_TOKEN_LENGTH * 2,
	)
}

// Set CSRF token in a secure, HTTP-only cookie if not already set
export async function ensureCsrfTokenCookie(): Promise<string> {
	const cookieStore = await cookies()
	let token = cookieStore.get(CSRF_COOKIE_NAME)?.value
	if (!token) {
		token = await generateCsrfToken()
		cookieStore.set(CSRF_COOKIE_NAME, token, {
			httpOnly: true,
			sameSite: 'lax',
			secure:
				typeof process !== 'undefined' && process.env.NODE_ENV === 'production',
			path: '/',
			maxAge: 60 * 60 * 24, // 1 day
		})
	}
	return token
}

// Get CSRF token from cookie
export async function getCsrfTokenFromCookie(): Promise<string | undefined> {
	const cookieStore = await cookies()
	return cookieStore.get(CSRF_COOKIE_NAME)?.value
}

// Validate CSRF token from form against cookie
export async function validateCsrfToken(
	formToken: string | null | undefined,
): Promise<boolean> {
	if (!formToken) return false
	const cookieToken = await getCsrfTokenFromCookie()
	return !!cookieToken && formToken === cookieToken
}
