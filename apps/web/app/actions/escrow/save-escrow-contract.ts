'use server'

import { supabase as supabaseServiceRole } from '@packages/lib/supabase'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

interface SaveEscrowContractParams {
	projectId: string
	contractId: string
	engagementId?: string
	escrowData?: {
		engagementId: string
		title: string
		description: string
		roles: {
			approver: string
			serviceProvider: string
			disputeResolver: string
			platformAddress: string
			releaseSigner: string
		}
		platformFee: number
		milestones?: Array<{
			amount: number
			receiver: string
		}>
		amount?: number // For single-release escrows
		receiver?: string // For single-release escrows
		receiverMemo?: number
	}
}

export async function saveEscrowContractAction(
	params: SaveEscrowContractParams,
): Promise<{ success: boolean; error?: string }> {
	try {
		// Log received parameters for debugging
		console.log('📥 saveEscrowContractAction received:', {
			contractId: params.contractId,
			projectId: params.projectId,
			hasEscrowData: !!params.escrowData,
			escrowDataKeys: params.escrowData ? Object.keys(params.escrowData) : [],
			engagementId: params.engagementId,
			escrowDataStructure: params.escrowData
				? JSON.stringify(params.escrowData, null, 2)
				: 'none',
			escrowDataType: typeof params.escrowData,
			escrowDataValue: params.escrowData,
		})

		// Ensure the request is authenticated
		const session = await getServerSession(nextAuthOption)
		const userId = session?.user?.id
		if (!userId) {
			return { success: false, error: 'Unauthorized' }
		}

		// Verify user has permission to update escrow for this project
		// Check if user is the project owner or has editor role
		const { data: project, error: projectError } = await supabaseServiceRole
			.from('projects')
			.select('id, kindler_id')
			.eq('id', params.projectId)
			.single()

		if (projectError || !project) {
			return { success: false, error: 'Project not found' }
		}

		// Check if user is the project owner
		const isOwner = project.kindler_id === userId

		// Check if user is a project member with editor role
		const { data: memberData } = await supabaseServiceRole
			.from('project_members')
			.select('role')
			.eq('project_id', params.projectId)
			.eq('user_id', userId)
			.in('role', ['core', 'admin', 'editor'])
			.single()

		const hasEditorRole = !!memberData

		if (!isOwner && !hasEditorRole) {
			return {
				success: false,
				error:
					'Forbidden: You do not have permission to update escrow for this project',
			}
		}

		// Use service role client for escrow update with manual authorization check
		const supabase = supabaseServiceRole

		// First, find the escrow_contracts record
		// Look up by contract_id (Stellar contract address)
		// Use maybeSingle() instead of single() to handle case when record doesn't exist
		const { data: existingEscrow, error: lookupError } = await supabase
			.from('escrow_contracts')
			.select('id')
			.eq('contract_id', params.contractId)
			.maybeSingle()

		if (lookupError) {
			throw new Error(
				`Failed to lookup escrow contract: ${lookupError.message}`,
			)
		}

		let escrowContractUuid: string

		if (existingEscrow?.id) {
			// Use existing record UUID
			escrowContractUuid = existingEscrow.id
		} else {
			// Create new escrow_contracts record - always create if it doesn't exist
			// Use escrowData if provided, otherwise use minimal defaults
			const engagementId =
				params.escrowData?.engagementId ||
				params.engagementId ||
				`project-${params.projectId}`

			// Calculate amount: for multi-release, sum milestone amounts; for single-release, use amount
			const totalAmount = params.escrowData?.milestones
				? params.escrowData.milestones.reduce((sum, m) => sum + m.amount, 0)
				: params.escrowData?.amount || 1 // Minimum amount to satisfy constraint

			// Determine payer and receiver addresses - use escrowData if available, otherwise use placeholder
			const payerAddress =
				params.escrowData?.roles?.serviceProvider ||
				params.escrowData?.roles?.approver ||
				'G000000000000000000000000000000000000000' // Placeholder Stellar address

			const receiverAddress =
				params.escrowData?.milestones && params.escrowData.milestones.length > 0
					? params.escrowData.milestones[0]?.receiver
					: params.escrowData?.receiver ||
						params.escrowData?.roles?.serviceProvider ||
						payerAddress

			const platformFee = params.escrowData?.platformFee ?? 0

			// Check if a contribution exists for this project, or create a placeholder
			const { data: existingContribution } = await supabase
				.from('contributions')
				.select('id')
				.eq('project_id', params.projectId)
				.order('created_at', { ascending: false })
				.limit(1)
				.maybeSingle()

			let contributionId: string

			if (existingContribution?.id) {
				contributionId = existingContribution.id
			} else {
				// Create a placeholder contribution for the escrow
				// This represents the project's escrow setup, not an actual contribution
				const { data: newContribution, error: contribError } = await supabase
					.from('contributions')
					.insert({
						project_id: params.projectId,
						contributor_id: userId, // Use current user as placeholder
						amount: totalAmount,
					})
					.select('id')
					.single()

				if (contribError || !newContribution?.id) {
					console.error(
						'❌ Failed to create contribution record:',
						contribError,
					)
					return {
						success: false,
						error: `Failed to create contribution record: ${contribError?.message || 'Unknown error'}`,
					}
				}

				contributionId = newContribution.id
			}

			// Create the escrow_contracts record
			// Note: current_state enum values are: NEW, FUNDED, ACTIVE, COMPLETED, DISPUTED, CANCELLED
			const { data: newEscrow, error: createError } = await supabase
				.from('escrow_contracts')
				.insert({
					contract_id: params.contractId,
					engagement_id: engagementId,
					project_id: params.projectId,
					contribution_id: contributionId,
					payer_address: payerAddress,
					receiver_address: receiverAddress,
					amount: totalAmount,
					platform_fee: platformFee,
					current_state: 'NEW',
				})
				.select('id')
				.single()

			if (createError || !newEscrow?.id) {
				console.error('❌ Failed to create escrow_contracts record:', {
					error: createError,
					contractId: params.contractId,
					engagementId,
					projectId: params.projectId,
					contributionId,
					payerAddress,
					receiverAddress,
					totalAmount,
					platformFee,
					hasEscrowData: !!params.escrowData,
					escrowDataKeys: params.escrowData
						? Object.keys(params.escrowData)
						: [],
				})
				return {
					success: false,
					error: `Failed to create escrow contract record: ${createError?.message || 'Unknown error'}. Details: ${JSON.stringify(createError)}`,
				}
			}

			escrowContractUuid = newEscrow.id
			console.log('✅ Created escrow_contracts record:', {
				id: escrowContractUuid,
				contractId: params.contractId,
				engagementId,
			})
		}

		// Upsert project_escrows - link project to escrow using the UUID
		// Since project can only have one escrow, we'll upsert by project_id
		const { error: upsertError } = await supabase
			.from('project_escrows')
			.upsert(
				{
					project_id: params.projectId,
					escrow_id: escrowContractUuid,
				},
				{
					onConflict: 'project_id',
				},
			)

		if (upsertError) {
			throw new Error(`Failed to save escrow contract: ${upsertError.message}`)
		}

		// Revalidate relevant paths
		revalidatePath(`/projects/[slug]/manage/settings`)
		revalidatePath(`/projects/[slug]/manage/settings/manage`)

		return {
			success: true,
		}
	} catch (error) {
		console.error('Error saving escrow contract:', error)
		return {
			success: false,
			error:
				error instanceof Error
					? error.message
					: 'Failed to save escrow contract',
		}
	}
}
