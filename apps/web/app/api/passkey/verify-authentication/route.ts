import { type NextRequest, NextResponse } from 'next/server'
import { InAppError } from '~/lib/passkey/errors'
import { verifyAuthentication } from '~/lib/passkey/passkey'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const input = {
			identifier: body.identifier,
			origin: req.headers.get('origin') || body.origin || '',
			authenticationResponse: body.authenticationResponse,
		}
		const options = await verifyAuthentication(input)
		return NextResponse.json(options)
	} catch (error) {
		console.error('Error verifying authentication', error)
		if (error instanceof InAppError) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}
		return NextResponse.json(
			{ error: 'Failed to verify authentication' },
			{ status: 500 },
		)
	}
}
