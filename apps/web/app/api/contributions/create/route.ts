import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { createContribution } from '~/lib/services/contributions/create-contribution.service'

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const { projectId, contractId, amount, transactionHash } = body

		const result = await createContribution({
			projectId,
			contractId,
			amount,
			transactionHash,
			userId: session.user.id,
			session,
			cookieHeader: req.headers.get('cookie'),
		})

		if (!result.success) {
			return NextResponse.json(
				{
					error: result.error,
					...(result.details ? { details: result.details } : {}),
				},
				{ status: result.status },
			)
		}

		if ('message' in result) {
			return NextResponse.json(
				{
					success: true,
					contributionId: result.contributionId,
					message: result.message,
				},
				{ status: result.status },
			)
		}

		return NextResponse.json(
			{
				success: true,
				contributionId: result.contributionId,
			},
			{ status: result.status },
		)
	} catch (error) {
		console.error('Create contribution error:', error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}
