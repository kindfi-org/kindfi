import { useSupabaseQuery } from '@packages/lib/hooks'
import { createSupabaseBrowserClient } from '@packages/lib/supabase-client'
import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { logger } from '~/lib'
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

	// Query for notifications using the shared hook
	const {
		data: notificationsData,
		isLoading,
		error,
		refresh: refetch,
	} = useSupabaseQuery(
		'notifications',
		() => notificationService.getNotifications(filters, sort, page, pageSize),
		{
			additionalKeyValues: [filters, sort, page, pageSize],
			staleTime: 1000 * 60 * 5, // 5 minutes
		},
	)

	// Query for unread count using the shared hook
	const { data: count } = useSupabaseQuery(
		'unread-count',
		async (client) => {
			const {
				data: { session },
			} = await client.auth.getSession()
			if (!session?.user?.id) {
				return 0 // No unread notifications for unauthenticated users
			}
			return notificationService.getUnreadCount(session.user.id)
		},
		{
			staleTime: 1000 * 60 * 2, // 2 minutes
		},
	)

	const onSuccessUpdate = () => {
		queryClient.invalidateQueries({
			queryKey: ['supabase', 'notifications'],
		})
		queryClient.invalidateQueries({
			queryKey: ['supabase', 'unread-count'],
		})
	}

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
			const {
				data: { session },
			} = await supabase.auth.getSession()
			if (!session?.user?.id) {
				throw new Error('User not authenticated')
			}
			return notificationService.markAllAsRead(session.user.id)
		},
		onSuccess: onSuccessUpdate,
	})

	// Mutation for deleting a notification
	const deleteNotification = useMutation({
		mutationFn: (id: string) => notificationService.deleteNotification(id),
		onSuccess: onSuccessUpdate,
	})

	// Set up real-time subscription for notifications
	useEffect(() => {
		let isMounted = true
		const channel = supabase
			.channel('notifications')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'notifications',
				},
				() => {
					if (isMounted) {
						refetch()
						queryClient.invalidateQueries({
							queryKey: ['supabase', 'unread-count'],
						})
					}
				},
			)
			.subscribe((status) => {
				if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
					logger.error({
						eventType: 'Notification Subscription Error',
						error: 'An error occurred with the notification subscription',
					})
					setConnectionState('disconnected')
				} else if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
					console.log('Notification subscription connected')
					setConnectionState('connected')
				}
			})

		return () => {
			isMounted = false
			channel.unsubscribe()
		}
	}, [supabase, refetch, queryClient])

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
