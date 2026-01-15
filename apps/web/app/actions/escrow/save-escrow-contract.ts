'use server'

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface SaveEscrowContractParams {
	projectId: string
	contractId: string
}

export async function saveEscrowContractAction(
	params: SaveEscrowContractParams,
): Promise<{ success: boolean; error?: string }> {
	const supabase = await createSupabaseServerClient()

	try {
		// Upsert project_escrows - only save the contract ID
		// Since project can only have one escrow, we'll upsert by project_id
		const { error: upsertError } = await supabase
			.from('project_escrows')
			.upsert(
				{
					project_id: params.projectId,
					escrow_id: params.contractId,
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
