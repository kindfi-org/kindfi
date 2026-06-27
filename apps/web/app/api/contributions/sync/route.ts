import { supabase } from '@packages/lib/supabase'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { syncContributionSchema } from '~/lib/schemas/contribution.schemas'
import {
	checkFundraisingGoalNotReached,
	createContributionWithProjectUpdate,
} from '~/lib/services/contribution-service'
import { validateRequest } from '~/lib/utils/validation'

/**
 * Sync an existing on-chain donation to the contributions table
 * This is useful when a donation was made but the contribution record wasn't created
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await req.json()
		const validation = validateRequest(syncContributionSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { contractId, projectId: providedProjectId, amount } = validation.data

		let projectId = providedProjectId

		// If projectId not provided, try to find it via contractId
		if (!projectId && contractId) {
			// Try to find via escrow_contracts table (direct lookup)
			const { data: escrowContract } = await supabase
				.from('escrow_contracts')
				.select('project_id')
				.eq('contract_id', contractId)
				.single()

			if (escrowContract?.project_id) {
				projectId = escrowContract.project_id
			} else {
				// If not found, the escrow contract might not be in the database
				// In this case, we'll allow creating the contribution if projectId is provided
				// or return a helpful error message
				return NextResponse.json(
					{
						error: 'Escrow contract not found in database',
						message:
							'The escrow contract address exists on-chain but is not recorded in our database. Please provide the project ID directly.',
						hint: 'You can find the project ID in the project page URL (e.g., /projects/[slug] - check the page source or network tab) or contact support.',
					},
					{ status: 404 },
				)
			}
		}

		if (!projectId) {
			return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
		}

		const goalCheck = await checkFundraisingGoalNotReached(projectId, contractId)
		if (!goalCheck.allowed) {
			return NextResponse.json({ error: goalCheck.error }, { status: 403 })
		}

		// Check if contribution already exists
		const { data: existingContribution } = await supabase
			.from('contributions')
			.select('id')
			.eq('project_id', projectId)
			.eq('contributor_id', session.user.id)
			.eq('amount', Number(amount))
			.single()

		if (existingContribution) {
			return NextResponse.json(
				{
					success: true,
					contributionId: existingContribution.id,
					message: 'Contribution already exists',
				},
				{ status: 200 },
			)
		}

		// Create contribution record and update project totals atomically
		const contributionResult = await createContributionWithProjectUpdate({
			projectId,
			contributorId: session.user.id,
			amount: Number(amount),
		})

		if (!contributionResult.success) {
			return NextResponse.json(
				{
					error: contributionResult.error,
					details: contributionResult.details,
				},
				{ status: 500 },
			)
		}

		return NextResponse.json(
			{
				success: true,
				contributionId: contributionResult.contributionId,
				message: 'Contribution synced successfully',
			},
			{ status: 201 },
		)
	} catch (error) {
		logger.error('Sync contribution error:', error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}
