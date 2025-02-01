import { type NextRequest, NextResponse } from 'next/server'
import { InAppError } from '~/lib/passkey/errors'
import { getRegistrationOptions } from '~/lib/passkey/passkey'

export async function POST(req: NextRequest) {
	const body = await req.json()
	const input = {
		identifier: body.identifier,
		origin: req.headers.get('origin') || body.origin || '',
	}
	try {
		const options = await getRegistrationOptions(input)
		return NextResponse.json(options)
	} catch (error) {
		if (error instanceof InAppError) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}
		return NextResponse.json(
			{ error: 'Failed to generate registration options' },
			{ status: 500 },
		)
	}
}
