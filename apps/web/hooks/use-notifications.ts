import { useSupabaseQuery } from '@packages/lib/hooks'
import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { NotificationService } from '../lib/services/notification-service'
import type {
	CreateNotificationDTO,
	NotificationFilters,
	NotificationSort,
	UpdateNotificationDTO,
} from '../lib/types/notification'

export function useNotifications(
	filters: NotificationFilters = {},
	sort: NotificationSort = { field: 'created_at', direction: 'desc' },
	page = 1,
	pageSize = 20,
) {
	const supabase = useMemo(() => createSupabaseBrowserClient(), [])
	const queryClient = useQueryClient()
	const [connectionState, setConnectionState] = useState<
		'connected' | 'disconnected'
	>('disconnected')
	const notificationService = useMemo(() => new NotificationService(), [])

	// Stabilize userId so the realtime effect only re-runs when the ID actually changes
	const userId = filters.user_id ?? null
	const hasUserId = !!userId

	// Query for notifications using the shared hook (only when user is logged in)
	const {
		data: notificationsData,
		isLoading,
		error,
		refresh: refetch,
	} = useSupabaseQuery(
		'notifications',
		() => notificationService.getNotifications(filters, sort, page, pageSize),
		{
			additionalKeyValues: [userId, sort, page, pageSize],
			staleTime: 1000 * 60 * 5, // 5 minutes
			enabled: hasUserId,
		},
	)

	// Query for unread count using the shared hook (only when user is logged in)
	const { data: count } = useSupabaseQuery(
		'unread-count',
		async () => {
			if (!userId) return 0
			return notificationService.getUnreadCount(userId)
		},
		{
			additionalKeyValues: [userId],
			staleTime: 1000 * 60 * 2, // 2 minutes
			enabled: hasUserId,
		},
	)

	// Stable invalidation callback — won't change between renders
	const invalidateQueries = useCallback(() => {
		queryClient.invalidateQueries({ queryKey: ['supabase', 'notifications'] })
		queryClient.invalidateQueries({ queryKey: ['supabase', 'unread-count'] })
	}, [queryClient])

	// Keep a ref to refetch so the realtime effect doesn't need it as a dep
	const refetchRef = useRef(refetch)
	useEffect(() => {
		refetchRef.current = refetch
	})

	const onSuccessUpdate = invalidateQueries

	// Mutation for creating a notification
	const createNotification = useMutation({
		mutationFn: (data: CreateNotificationDTO) =>
			notificationService.createNotification(data),
		onSuccess: onSuccessUpdate,
	})

	// Mutation for updating a notification
	const updateNotification = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateNotificationDTO }) =>
			notificationService.updateNotification(id, data),
		onSuccess: onSuccessUpdate,
	})

	// Mutation for marking a notification as read
	const markAsRead = useMutation({
		mutationFn: (id: string) => notificationService.markAsRead(id),
		onSuccess: onSuccessUpdate,
	})

	// Mutation for marking all notifications as read
	const markAllAsRead = useMutation({
		mutationFn: async () => {
			if (!userId) throw new Error('User not authenticated')
			return notificationService.markAllAsRead(userId)
		},
		onSuccess: onSuccessUpdate,
	})

	// Mutation for deleting a notification
	const deleteNotification = useMutation({
		mutationFn: (id: string) => notificationService.deleteNotification(id),
		onSuccess: onSuccessUpdate,
	})

	// Set up real-time subscription for notifications (only when user is logged in)
	useEffect(() => {
		if (!userId) return

		let isMounted = true
		const channel = supabase
			.channel(`notifications:${userId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'notifications',
					filter: `user_id=eq.${userId}`,
				},
				() => {
					if (isMounted) {
						refetchRef.current()
						queryClient.invalidateQueries({
							queryKey: ['supabase', 'unread-count'],
						})
					}
				},
			)
			.subscribe((status) => {
				if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
					setConnectionState('disconnected')
				} else if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
					setConnectionState('connected')
				}
			})

		return () => {
			isMounted = false
			channel.unsubscribe()
		}
	}, [supabase, queryClient, userId])

	return {
		notifications: notificationsData?.data || [],
		totalCount: notificationsData?.count || 0,
		unreadCount: count ?? 0,
		isLoading,
		error,
		connectionState,
		createNotification: createNotification.mutate,
		updateNotification: updateNotification.mutate,
		markAsRead: markAsRead.mutate,
		markAllAsRead: markAllAsRead.mutate,
		deleteNotification: deleteNotification.mutate,
		refetch,
	}
}
