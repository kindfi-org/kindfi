import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { authorizeFinancialAction } from '~/lib/kyc/authorization-service'
import { toKycDenialPayload } from '~/lib/kyc/denial'
import { KYC_FINANCIAL_ACTIONS, type KycFinancialAction } from '~/lib/kyc/types'

const authorizeBodySchema = (
	body: unknown,
): {
	action: KycFinancialAction
	amount?: number
	asset?: string
	network?: string
} | null => {
	if (!body || typeof body !== 'object') return null
	const value = body as Record<string, unknown>
	if (typeof value.action !== 'string') return null
	if (!(KYC_FINANCIAL_ACTIONS as readonly string[]).includes(value.action)) return null
	return {
		action: value.action as KycFinancialAction,
		amount: typeof value.amount === 'number' ? value.amount : undefined,
		asset: typeof value.asset === 'string' ? value.asset : undefined,
		network: typeof value.network === 'string' ? value.network : undefined,
	}
}

/**
 * POST /api/kyc/authorize
 *
 * Server-side authorization check for a financial action. Used by the UI as
 * a preflight; API routes still re-check. Never trusts a client KYC status.
 */
export async function POST(req: NextRequest) {
	const session = await getServerSession(nextAuthOption)
	if (!session?.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 })
	}

	const parsed = authorizeBodySchema(body)
	if (!parsed) {
		return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
	}

	const result = await authorizeFinancialAction({
		userId: session.user.id,
		action: parsed.action,
		amount: parsed.amount,
		asset: parsed.asset,
		network: parsed.network,
	})

	if (!result.allowed) {
		return NextResponse.json(toKycDenialPayload(result), { status: 403 })
	}

	return NextResponse.json(result)
}
