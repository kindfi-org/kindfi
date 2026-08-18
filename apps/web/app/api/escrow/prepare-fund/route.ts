import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import type { EscrowType, FundEscrowPayload } from '@trustless-work/escrow'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { RateLimiter } from '~/lib/auth/rate-limiter'
import { ensureEscrowIndexedForContract } from '~/lib/services/escrow-indexer.service'
import { fundEscrowViaTrustlessWorkServer } from '~/lib/services/trustless-fund-escrow.server'
import {
	type EscrowApiVersion,
	readDeployTxHashFromMetadata,
} from '~/lib/utils/escrow/resolve-escrow-api-version'

const fundLimiter = new RateLimiter({
	maxAttempts: 30,
	windowSecs: 60,
	blockSecs: 300,
	configId: 'escrow-prepare-fund',
})

const prepareFundSchema = z.object({
	payload: z.object({
		contractId: z.string().min(1),
		signer: z.string().min(1),
		amount: z.number().positive(),
	}),
	escrowType: z.enum(['single-release', 'multi-release']),
	contractApiVersion: z.enum(['v1', 'v2']).optional(),
})

const getClientIp = (request: Request): string =>
	request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'

export async function POST(request: Request) {
	const session = await getServerSession(nextAuthOption)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const rateLimit = await fundLimiter.increment(getClientIp(request), 'escrow-prepare-fund')
	if (rateLimit.isBlocked) {
		return NextResponse.json(
			{ error: 'Too many requests. Please try again later.' },
			{ status: 429, headers: { 'Retry-After': '300' } },
		)
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
	}

	const parsed = prepareFundSchema.safeParse(body)
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
	}

	const { payload, escrowType, contractApiVersion = 'v1' } = parsed.data
	const contractId = payload.contractId.trim()

	const { data: escrowRow } = await supabaseServiceRole
		.from('escrow_contracts')
		.select('metadata')
		.eq('contract_id', contractId)
		.maybeSingle()

	const deployTxHash = readDeployTxHashFromMetadata(escrowRow?.metadata)

	const indexed = await ensureEscrowIndexedForContract(contractId, deployTxHash)
	if (!indexed.ok) {
		return NextResponse.json(
			{
				error:
					'This escrow is not registered with Trustless Work yet. A platform admin must sync the deploy transaction hash from project settings.',
				detail: indexed.error,
			},
			{ status: 404 },
		)
	}

	const fundResult = await fundEscrowViaTrustlessWorkServer(
		payload as FundEscrowPayload,
		escrowType as EscrowType,
		contractApiVersion as EscrowApiVersion,
	)

	if (fundResult.status !== 'SUCCESS' || !fundResult.unsignedTransaction) {
		const message = fundResult.error ?? 'Fund escrow request failed'
		const status = message.toLowerCase().includes('escrow not found') ? 404 : 400

		return NextResponse.json({ error: message }, { status })
	}

	return NextResponse.json({
		status: 'SUCCESS',
		unsignedTransaction: fundResult.unsignedTransaction,
	})
}
