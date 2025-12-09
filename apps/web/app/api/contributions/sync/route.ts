import { supabase } from '@packages/lib/supabase'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { nextAuthOption } from '~/lib/auth/auth-options'

/**
 * Sync an existing on-chain donation to the contributions table
 * This is useful when a donation was made but the contribution record wasn't created
 */
export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 },
			)
		}

		const body = await req.json()
		const { contractId, projectId: providedProjectId, amount } = body

		if ((!contractId && !providedProjectId) || !amount || amount <= 0) {
			return NextResponse.json(
				{ error: 'Invalid request. contractId (or projectId) and amount are required.' },
				{ status: 400 },
			)
		}

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
						message: 'The escrow contract address exists on-chain but is not recorded in our database. Please provide the project ID directly.',
						hint: 'You can find the project ID in the project page URL (e.g., /projects/[slug] - check the page source or network tab) or contact support.'
					},
					{ status: 404 },
				)
			}
		}

		if (!projectId) {
			return NextResponse.json(
				{ error: 'Project ID is required' },
				{ status: 400 },
			)
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
					message: 'Contribution already exists' 
				},
				{ status: 200 },
			)
		}

		// Create contribution record
		const { data: contribution, error: contributionError } = await supabase
			.from('contributions')
			.insert({
				project_id: projectId,
				contributor_id: session.user.id,
				amount: Number(amount),
			})
			.select('id')
			.single()

		if (contributionError) {
			console.error('Error creating contribution:', contributionError)
			return NextResponse.json(
				{ error: 'Failed to create contribution', details: contributionError.message },
				{ status: 500 },
			)
		}

		// Update project's current_amount (raised amount)
		const { error: updateError } = await supabase.rpc('increment_project_amount', {
			project_id_param: projectId,
			amount_param: Number(amount),
		})

		// If RPC doesn't exist, fallback to manual update
		if (updateError) {
			const { data: project } = await supabase
				.from('projects')
				.select('current_amount')
				.eq('id', projectId)
				.single()

			if (project) {
				await supabase
					.from('projects')
					.update({
						current_amount: (project.current_amount || 0) + Number(amount),
					})
					.eq('id', projectId)
			}
		}

		return NextResponse.json(
			{
				success: true,
				contributionId: contribution.id,
				message: 'Contribution synced successfully',
			},
			{ status: 201 },
		)
	} catch (error) {
		console.error('Sync contribution error:', error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : 'Internal server error',
			},
			{ status: 500 },
		)
	}
}

