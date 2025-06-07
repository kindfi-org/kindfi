import { createClient } from '@supabase/supabase-js'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { NotificationService } from '../lib/services/notification-service'
import type {
	CreateNotificationDTO,
	Notification,
	NotificationFilters,
	NotificationSort,
	UpdateNotificationDTO,
} from '../lib/types/notification'

const notificationService = new NotificationService()
const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export function useNotifications(
	filters: NotificationFilters = {},
	sort: NotificationSort = { field: 'created_at', direction: 'desc' },
	page = 1,
	pageSize = 20,
) {
	const queryClient = useQueryClient()
	const [unreadCount, setUnreadCount] = useState(0)

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
		queryFn: () => notificationService.getUnreadCount(),
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
					refetch()
					notificationService.getUnreadCount().then(setUnreadCount)
				},
			)
			.subscribe()

		return () => {
			channel.unsubscribe()
		}
	}, [refetch])

	return {
		notifications: notificationsData?.data || [],
		totalCount: notificationsData?.count || 0,
		unreadCount,
		isLoading,
		error,
		createNotification: createNotification.mutate,
		updateNotification: updateNotification.mutate,
		markAsRead: markAsRead.mutate,
		markAllAsRead: markAllAsRead.mutate,
		deleteNotification: deleteNotification.mutate,
		refetch,
	}
}
