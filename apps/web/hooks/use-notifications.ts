import { REALTIME_SUBSCRIBE_STATES } from '@supabase/realtime-js'
import type { RealtimeChannel } from '@supabase/realtime-js'
import { createClient } from '@supabase/supabase-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { env } from '../lib/config/env'
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
	const supabase = useMemo(
		() =>
			createClient(
				env().NEXT_PUBLIC_SUPABASE_URL,
				env().NEXT_PUBLIC_SUPABASE_ANON_KEY,
			),
		[],
	)
	const queryClient = useQueryClient()
	const [unreadCount, setUnreadCount] = useState(0)
	const [connectionState, setConnectionState] = useState<
		'connected' | 'disconnected'
	>('disconnected')
	const notificationService = useMemo(() => new NotificationService(), [])

	// Query for notifications
	const {
		data: notificationsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['notifications', filters, sort, page, pageSize],
		queryFn: () =>
			notificationService.getNotifications(filters, sort, page, pageSize),
	})

	// Query for unread count
	const { data: count } = useQuery({
		queryKey: ['notifications', 'unread-count'],
		queryFn: async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession()
			return notificationService.getUnreadCount(session?.user?.id || '')
		},
	})

	// Update unread count when count changes
	useEffect(() => {
		if (count !== undefined) {
			setUnreadCount(count)
		}
	}, [count])

	// Mutation for creating a notification
	const createNotification = useMutation({
		mutationFn: (data: CreateNotificationDTO) =>
			notificationService.createNotification(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] })
			queryClient.invalidateQueries({
				queryKey: ['notifications', 'unread-count'],
			})
		},
	})

	// Mutation for updating a notification
	const updateNotification = useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateNotificationDTO }) =>
			notificationService.updateNotification(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] })
			queryClient.invalidateQueries({
				queryKey: ['notifications', 'unread-count'],
			})
		},
	})

	// Mutation for marking a notification as read
	const markAsRead = useMutation({
		mutationFn: (id: string) => notificationService.markAsRead(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] })
			queryClient.invalidateQueries({
				queryKey: ['notifications', 'unread-count'],
			})
		},
	})

	// Mutation for marking all notifications as read
	const markAllAsRead = useMutation({
		mutationFn: () => notificationService.markAllAsRead(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] })
			queryClient.invalidateQueries({
				queryKey: ['notifications', 'unread-count'],
			})
		},
	})

	// Mutation for deleting a notification
	const deleteNotification = useMutation({
		mutationFn: (id: string) => notificationService.deleteNotification(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['notifications'] })
			queryClient.invalidateQueries({
				queryKey: ['notifications', 'unread-count'],
			})
		},
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
						supabase.auth
							.getSession()
							.then(({ data: { session } }) =>
								notificationService.getUnreadCount(session?.user?.id || ''),
							)
							.then(setUnreadCount)
							.catch((error) => {
								console.error('Failed to update unread count:', error)
							})
					}
				},
			)
			.subscribe((status) => {
				if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
					console.error('Notification subscription error')
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
	}, [refetch, notificationService, supabase])

	return {
		notifications: notificationsData?.data || [],
		totalCount: notificationsData?.count || 0,
		unreadCount,
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
