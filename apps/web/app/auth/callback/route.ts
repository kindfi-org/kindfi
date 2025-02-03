import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createClient } from '~/lib/supabase/server'

// List of allowed domains for redirection
const ALLOWED_DOMAINS = [
	'kindfi.org',
	'kindfi.vercel.app',
	'kind-fi.com',
	/^kindfi-[\w-]+\.vercel\.app$/, // Dynamic subdomains
]

// Function to validate redirect URLs
function isValidRedirectUrl(url: string): boolean {
	try {
		const parsedUrl = new URL(url)
		// Check if the hostname matches any allowed domain
		return ALLOWED_DOMAINS.some((domain) =>
			typeof domain === 'string'
				? parsedUrl.hostname === domain
				: domain.test(parsedUrl.hostname),
		)
	} catch (error) {
		console.error(`Invalid URL format: ${url}`)
		return false // If the URL is invalid, return false
	}
}

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get('code')
	const redirectUrl = requestUrl.searchParams.get('redirect')

	console.log(`Incoming request URL: ${requestUrl}`)
	console.log(`Redirect URL: ${redirectUrl}`)

	// If redirect URL is missing or invalid, return a JSON error
	if (!redirectUrl || !isValidRedirectUrl(redirectUrl)) {
		console.warn(`Invalid or missing redirect URL: ${redirectUrl}`)
		return NextResponse.json({ error: 'Invalid redirect URL' }, { status: 400 })
	}

	// Exchange the code for a Supabase session if provided
	if (code) {
		try {
			const supabase = await createClient()
			await supabase.auth.exchangeCodeForSession(code)
		} catch (error) {
			console.error(`Error exchanging code for session: ${error}`)
			return NextResponse.json(
				{ error: 'Failed to exchange code for session' },
				{ status: 500 },
			)
		}
	}

	// Redirect to the validated URL
	console.log(`Final Redirect URL: ${redirectUrl}`)
	return NextResponse.redirect(redirectUrl)
}
