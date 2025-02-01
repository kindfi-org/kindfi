import { type NextRequest, NextResponse } from 'next/server'
import { InAppError } from '~/lib/passkey/errors'
import { verifyRegistration } from '~/lib/passkey/passkey'

export async function POST(req: NextRequest) {
	try {
		const body = await req.json()
		const input = {
			identifier: body.identifier,
			origin: req.headers.get('origin') || body.origin || '',
			registrationResponse: body.registrationResponse,
		}
		const options = await verifyRegistration(input)
		return NextResponse.json(options)
	} catch (error) {
		if (error instanceof InAppError) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}
		console.error('Error verifying registration', error)
		return NextResponse.json(
			{ error: 'Failed to verify registration' },
			{ status: 500 },
		)
	}
}
