// apps/web/hooks/useEscrow.ts
'use client'

import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'

// Database type includes CANCELLED
type EscrowStatusType =
	| 'NEW'
	| 'FUNDED'
	| 'ACTIVE'
	| 'COMPLETED'
	| 'DISPUTED'
	| 'CANCELLED'

interface DatabaseEscrowRecord {
	id: string
	escrow_id: string
	status: EscrowStatusType
	current_milestone: number
	total_funded: number
	total_released: number
	last_updated: string
	metadata: {
		total_milestones?: number
		completed_milestones?: number
	}
}

// Interface type excludes CANCELLED as per requirements
interface EscrowStatus {
	state: 'NEW' | 'FUNDED' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED'
	milestoneStatus: {
		current: number
		total: number
		completed: number
	}
	financials: {
		totalFunded: number
		totalReleased: number
		pendingRelease: number
	}
}

export function useEscrow(escrowId: string) {
	const [status, setStatus] = useState<EscrowStatus | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const [rawRecord, setRawRecord] = useState<DatabaseEscrowRecord | null>(null)
	const supabase = createClient()

	// Convert database record to required interface format
	const transformRecord = (
		record: DatabaseEscrowRecord,
	): EscrowStatus | null => {
		// Skip cancelled records as they're not part of the interface
		if (record.status === 'CANCELLED') return null

		return {
			state: record.status as EscrowStatus['state'],
			milestoneStatus: {
				current: record.current_milestone,
				total: record.metadata?.total_milestones || 0,
				completed: record.metadata?.completed_milestones || 0,
			},
			financials: {
				totalFunded: Number(record.total_funded) || 0,
				totalReleased: Number(record.total_released) || 0,
				pendingRelease:
					(Number(record.total_funded) || 0) -
					(Number(record.total_released) || 0),
			},
		}
	}

	const fetchEscrowStatus = async () => {
		try {
			const { data, error: fetchError } = await supabase
				.from('escrow_status')
				.select('*')
				.eq('escrow_id', escrowId)
				.single()

			if (fetchError) throw fetchError

			if (data) {
				setRawRecord(data)
				const transformed = transformRecord(data)
				if (transformed) setStatus(transformed)
			}
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error('Failed to fetch escrow status'),
			)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchEscrowStatus()

		// Set up real-time subscription
		const channel = supabase.channel(`public:escrow_status:id=eq.${escrowId}`)

		channel
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'escrow_status',
					filter: `escrow_id=eq.${escrowId}`,
				},
				(payload) => {
					if (payload.new) {
						setRawRecord(payload.new as DatabaseEscrowRecord)
						const transformed = transformRecord(
							payload.new as DatabaseEscrowRecord,
						)
						if (transformed) setStatus(transformed)
					}
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [escrowId])

	const updateStatus = async (newStatus: EscrowStatusType) => {
		try {
			if (!rawRecord) throw new Error('No record to update')

			const { error: updateError } = await supabase
				.from('escrow_status')
				.update({
					status: newStatus,
					last_updated: new Date().toISOString(),
				})
				.eq('id', rawRecord.id)

			if (updateError) throw updateError
			await fetchEscrowStatus()
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error('Failed to update status'),
			)
			throw err
		}
	}

	const updateMilestone = async (current: number, completed: number) => {
		try {
			if (!rawRecord) throw new Error('No record to update')

			const { error: updateError } = await supabase
				.from('escrow_status')
				.update({
					current_milestone: current,
					metadata: {
						...rawRecord.metadata,
						completed_milestones: completed,
					},
					last_updated: new Date().toISOString(),
				})
				.eq('id', rawRecord.id)

			if (updateError) throw updateError
			await fetchEscrowStatus()
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error('Failed to update milestone'),
			)
			throw err
		}
	}

	const updateFinancials = async (funded: number, released: number) => {
		try {
			if (!rawRecord) throw new Error('No record to update')

			const { error: updateError } = await supabase
				.from('escrow_status')
				.update({
					total_funded: funded,
					total_released: released,
					last_updated: new Date().toISOString(),
				})
				.eq('id', rawRecord.id)

			if (updateError) throw updateError
			await fetchEscrowStatus()
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error('Failed to update financials'),
			)
			throw err
		}
	}

	return {
		status,
		loading,
		error,
		updateStatus,
		updateMilestone,
		updateFinancials,
	}
}
