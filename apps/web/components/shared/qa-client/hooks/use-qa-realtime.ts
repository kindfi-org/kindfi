import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import type { TypedSupabaseClient } from '@packages/lib/types'
import type { Tables, TablesUpdate } from '@services/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { UserData } from '~/lib/types/project/project-qa.types'

interface UseQARealtimeOptions {
	projectId: string
	effectiveUserId?: string
}

export const useQARealtime = ({ projectId, effectiveUserId }: UseQARealtimeOptions) => {
	const queryClient = useQueryClient()
	const [isRealtimeEnabled, setIsRealtimeEnabled] = useState(true)
	const [realtimeActivity, setRealtimeActivity] = useState(false)
	const [realtimeStatus, setRealtimeStatus] = useState<string | null>(null)
	const subscriptionRef = useRef<ReturnType<TypedSupabaseClient['channel']> | null>(null)

	const showStatus = useCallback((message: string, duration = 3000) => {
		setRealtimeStatus(message)
		setTimeout(() => setRealtimeStatus(null), duration)
	}, [])

	const flashActivity = useCallback((duration = 3000) => {
		setRealtimeActivity(true)
		setTimeout(() => setRealtimeActivity(false), duration)
	}, [])

	useEffect(() => {
		const supabase = createSupabaseBrowserClient()
		if (isRealtimeEnabled) {
			if (subscriptionRef.current) {
				supabase.removeChannel(subscriptionRef.current)
			}

			const channel = supabase
				.channel('comments-changes')
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'comments',
						filter: `project_id=eq.${projectId}`,
					},
					(payload: RealtimePostgresChangesPayload<TablesUpdate<'comments'>>) => {
						flashActivity()

						queryClient.invalidateQueries({
							queryKey: ['supabase', 'projectQuestions', projectId],
						})
						queryClient.invalidateQueries({
							queryKey: ['supabase', 'projectComments', projectId],
						})

						const eventType = payload.eventType
						const record = payload.new as Tables<'comments'> | null
						const metadata = (record?.metadata || {}) as Record<string, unknown>

						if (eventType === 'INSERT') {
							const commentType = record?.type || 'comment'

							if (record?.author_id !== effectiveUserId) {
								showStatus(`New ${commentType} added to the discussion`, 5000)
							}
						} else if (eventType === 'UPDATE' && metadata.status === 'resolved') {
							showStatus('A question has been marked as resolved', 5000)
						}
					},
				)
				.subscribe((status) => {
					if (status === 'SUBSCRIBED') {
						showStatus('Real-time connection established')
					}
				})

			subscriptionRef.current = channel

			return () => {
				supabase.removeChannel(channel)
			}
		}

		if (!subscriptionRef.current) {
			return
		}

		supabase.removeChannel(subscriptionRef.current)
		subscriptionRef.current = null
	}, [isRealtimeEnabled, projectId, queryClient, effectiveUserId, flashActivity, showStatus])

	const handleManualRefresh = (refetchQuestions: () => void) => {
		refetchQuestions()
		flashActivity(1000)
		showStatus('Q&A refreshed')
	}

	const toggleRealtime = () => {
		setIsRealtimeEnabled(!isRealtimeEnabled)
		showStatus(isRealtimeEnabled ? 'Real-time updates disabled' : 'Real-time updates enabled')
	}

	return {
		isRealtimeEnabled,
		realtimeActivity,
		realtimeStatus,
		setRealtimeStatus,
		handleManualRefresh,
		toggleRealtime,
	}
}

export type { UserData }
