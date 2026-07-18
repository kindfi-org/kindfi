'use server'

import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import type { Database } from '@services/supabase'
import { revalidatePath } from 'next/cache'
import {
	requireAdminSession,
	type ServerActionFailure,
	toServerActionFailure,
	validateInput,
} from '~/lib/auth/server-action-auth'
import { Logger } from '~/lib/logger'
import {
	updateEscrowFinancialsInputSchema,
	updateEscrowMilestoneInputSchema,
	updateEscrowStatusInputSchema,
} from '~/lib/schemas/server-actions.schemas'

type Tables = Database['public']['Tables']
type EscrowRecord = Tables['escrow_status']['Row']

type EscrowResponse = {
	success: boolean
	message: string
	data?: EscrowRecord | EscrowRecord[] | null
	error?: string | null
}

const logger = new Logger()

function escrowFailureFromAction(
	failure: ServerActionFailure,
	fallbackMessage: string,
): EscrowResponse {
	return {
		success: false,
		message: failure.error || fallbackMessage,
		error: failure.error,
	}
}

export async function updateEscrowStatusAction(
	id: string,
	newStatus: string,
): Promise<EscrowResponse> {
	try {
		await requireAdminSession('updateEscrowStatusAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	let validated: { id: string; newStatus: EscrowRecord['status'] }
	try {
		validated = validateInput(
			updateEscrowStatusInputSchema,
			{ id, newStatus },
			'updateEscrowStatusAction',
		) as { id: string; newStatus: EscrowRecord['status'] }
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Invalid input'), 'Invalid input')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				status: validated.newStatus,
				last_updated: new Date().toISOString(),
			})
			.eq('id', validated.id)
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: `Status updated to ${validated.newStatus}`,
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_STATUS_UPDATE_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			id: validated.id,
			newStatus: validated.newStatus,
		})
		return {
			success: false,
			message: 'Failed to update escrow status',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function updateEscrowMilestoneAction(
	id: string,
	current: number,
	completed: number,
): Promise<EscrowResponse> {
	try {
		await requireAdminSession('updateEscrowMilestoneAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	let validated: { id: string; current: number; completed: number }
	try {
		validated = validateInput(
			updateEscrowMilestoneInputSchema,
			{ id, current, completed },
			'updateEscrowMilestoneAction',
		)
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Invalid input'), 'Invalid input')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				current_milestone: validated.current,
				metadata: {
					milestoneStatus: {
						current: validated.current,
						completed: validated.completed,
					},
				},
				last_updated: new Date().toISOString(),
			})
			.eq('id', validated.id)
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: 'Milestone updated successfully',
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_MILESTONE_UPDATE_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			id: validated.id,
			current: validated.current,
			completed: validated.completed,
		})
		return {
			success: false,
			message: 'Failed to update milestone',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function updateEscrowFinancialsAction(
	id: string,
	funded: number,
	released: number,
): Promise<EscrowResponse> {
	try {
		await requireAdminSession('updateEscrowFinancialsAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	let validated: { id: string; funded: number; released: number }
	try {
		validated = validateInput(
			updateEscrowFinancialsInputSchema,
			{ id, funded, released },
			'updateEscrowFinancialsAction',
		)
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Invalid input'), 'Invalid input')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.update({
				total_funded: validated.funded,
				total_released: validated.released,
				last_updated: new Date().toISOString(),
			})
			.eq('id', validated.id)
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: 'Financials updated successfully',
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_FINANCIALS_UPDATE_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
			id: validated.id,
			funded: validated.funded,
			released: validated.released,
		})
		return {
			success: false,
			message: 'Failed to update financials',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function getEscrowRecordsAction(): Promise<EscrowResponse> {
	try {
		await requireAdminSession('getEscrowRecordsAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.select('*')
			.order('last_updated', { ascending: false })

		if (error) throw error

		return {
			success: true,
			message: 'Records fetched successfully',
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_RECORDS_FETCH_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
		return {
			success: false,
			message: 'Failed to fetch records',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

export async function insertTestEscrowRecordAction(): Promise<EscrowResponse> {
	if (process.env.NODE_ENV === 'production') {
		return {
			success: false,
			message: 'Test record insertion is disabled in production',
			error: 'Forbidden',
		}
	}

	try {
		await requireAdminSession('insertTestEscrowRecordAction')
	} catch (error) {
		return escrowFailureFromAction(toServerActionFailure(error, 'Forbidden'), 'Forbidden')
	}

	const supabase = await createSupabaseServerClient()

	try {
		const { data, error } = await supabase
			.from('escrow_status')
			.insert([
				{
					escrow_id: `test-${Date.now()}`,
					status: 'NEW',
					current_milestone: 1,
					total_funded: 1000,
					total_released: 0,
					metadata: {
						milestoneStatus: {
							total: 3,
							completed: 0,
						},
					},
				},
			])
			.select()
			.single()

		if (error) throw error

		revalidatePath('/admin/escrow')
		return {
			success: true,
			message: 'Test record inserted successfully',
			data,
		}
	} catch (error) {
		logger.error({
			eventType: 'ESCROW_TEST_RECORD_INSERT_ERROR',
			error: error instanceof Error ? error.message : 'Unknown error',
		})
		return {
			success: false,
			message: 'Failed to insert test record',
			error: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}
