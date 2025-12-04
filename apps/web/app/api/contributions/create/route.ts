import { supabase } from '@packages/lib/supabase'
import { getServerSession } from 'next-auth'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { AppError } from '~/lib/error'

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
		const { projectId, contractId, amount, transactionHash } = body

		// If contractId is provided but projectId is not, find project by escrow contract address
		let finalProjectId = projectId
		if (!finalProjectId && contractId) {
			// Find the escrow_contracts record by contract_id (Stellar contract address)
			// escrow_contracts has a direct project_id field
			const { data: escrowContract, error: escrowContractError } = await supabase
				.from('escrow_contracts')
				.select('project_id')
				.eq('contract_id', contractId)
				.single()

			if (escrowContractError || !escrowContract) {
				return NextResponse.json(
					{ error: 'Escrow contract not found for the provided contract ID' },
					{ status: 404 },
				)
			}

			finalProjectId = escrowContract.project_id
		}

		if (!finalProjectId || !amount || amount <= 0) {
			return NextResponse.json(
				{ error: 'Invalid request. projectId (or contractId) and amount are required.' },
				{ status: 400 },
			)
		}

		// Check if contribution already exists for this transaction hash (to avoid duplicates)
		if (transactionHash) {
			const { data: existingTransaction } = await supabase
				.from('transactions')
				.select('id')
				.eq('transaction_hash', transactionHash)
				.single()

			if (existingTransaction) {
				// Check if contribution already exists for this transaction
				const { data: existingContribution } = await supabase
					.from('contributions')
					.select('id')
					.eq('project_id', finalProjectId)
					.eq('contributor_id', session.user.id)
					.single()

				if (existingContribution) {
					return NextResponse.json(
						{ success: true, contributionId: existingContribution.id, message: 'Contribution already exists' },
						{ status: 200 },
					)
				}
			}
		}

		// Create contribution record
		const { data: contribution, error: contributionError } = await supabase
			.from('contributions')
			.insert({
				project_id: finalProjectId,
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
			project_id_param: finalProjectId,
			amount_param: Number(amount),
		})

		// If RPC doesn't exist, fallback to manual update
		if (updateError) {
			const { data: project } = await supabase
				.from('projects')
				.select('current_amount')
				.eq('id', finalProjectId)
				.single()

			if (project) {
				await supabase
					.from('projects')
					.update({
						current_amount: (project.current_amount || 0) + Number(amount),
					})
					.eq('id', finalProjectId)
			}
		}

		return NextResponse.json(
			{
				success: true,
				contributionId: contribution.id,
			},
			{ status: 201 },
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

