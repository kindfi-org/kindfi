import { NextResponse } from 'next/server'

const LEGACY_ESCROW_MESSAGE =
	'Legacy /api/escrow routes were removed. Escrow flows use the Trustless Work React SDK via /api/trustless-work with client-side wallet signing.'

/** Uniform response for retired v1 escrow API routes. */
export const legacyEscrowRouteResponse = (): Response =>
	NextResponse.json(
		{
			error: 'Gone',
			message: LEGACY_ESCROW_MESSAGE,
		},
		{
			status: 410,
			headers: { 'Cache-Control': 'no-store' },
		},
	)
