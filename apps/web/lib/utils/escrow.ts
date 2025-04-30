import { createSupabaseBrowserClient } from '@packages/lib/src/supabase/browser-client'
import type { Database, Json } from '@services/supabase/src/database.types'

type Tables = Database['public']['Tables']
type EscrowRecord = Tables['escrow_status']['Row']
type EscrowStatusType =
	| 'NEW'
	| 'FUNDED'
	| 'ACTIVE'
	| 'COMPLETED'
	| 'DISPUTED'
	| 'CANCELLED'

interface MilestoneMetadata {
	milestoneStatus: {
		total: number
		completed: number
	}
}

export const updateEscrowStatus = async (
	recordId: string,
	newStatus: EscrowStatusType,
): Promise<EscrowRecord> => {
	const supabase = createSupabaseBrowserClient()

	const { data, error: updateError } = await supabase
		.from('escrow_status')
		.update({
			status: newStatus,
			last_updated: new Date().toISOString(),
		})
		.eq('id', recordId)
		.select()
		.single()

	if (updateError) throw updateError
	if (!data) throw new Error('Failed to update escrow status')

	return data
}

export const updateEscrowMilestone = async (
	recordId: string,
	current: number,
	completed: number,
	metadata?: Partial<MilestoneMetadata>,
): Promise<EscrowRecord> => {
	const supabase = createSupabaseBrowserClient()

	if (current < 1 || completed < 0) {
		throw new Error('Milestone numbers must be positive')
	}

	const total = metadata?.milestoneStatus?.total ?? completed
	if (completed > total) {
		throw new Error('Completed milestones cannot exceed total milestones')
	}

	const updatedMetadata: MilestoneMetadata = {
		milestoneStatus: {
			total,
			completed,
		},
	}
	const { data, error: updateError } = await supabase
		.from('escrow_status')
		.update({
			current_milestone: current,
			metadata: updatedMetadata as unknown as Json,
			last_updated: new Date().toISOString(),
		})
		.eq('id', recordId)
		.select()
		.single()
	if (updateError) throw updateError
	if (!data) throw new Error('Failed to update milestone')

	return data
}

export const updateEscrowFinancials = async (
	recordId: string,
	funded: number,
	released: number,
): Promise<EscrowRecord> => {
	const supabase = createSupabaseBrowserClient()

	if (funded < released) {
		throw new Error('Total funded cannot be less than total released')
	}

	const { data, error: updateError } = await supabase
		.from('escrow_status')
		.update({
			total_funded: funded,
			total_released: released,
			last_updated: new Date().toISOString(),
		})
		.eq('id', recordId)
		.select()
		.single()

	if (updateError) throw updateError
	if (!data) throw new Error('Failed to update financials')

	return data
}
