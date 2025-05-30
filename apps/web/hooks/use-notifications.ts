import { formatNotificationDate } from '@/lib/utils'
import { useSupabase } from '@kindfi/lib'
import type { Database } from '@kindfi/lib/types/supabase'
import { useCallback, useEffect, useState } from 'react'

type Notification = Database['public']['Tables']['notifications']['Row']

export function useNotifications(userId: string) {
	const { supabase } = useSupabase()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const [hasMore, setHasMore] = useState(true)
	const [page, setPage] = useState(0)
	const PAGE_SIZE = 20

	const fetchNotifications = useCallback(
		async (pageNum: number) => {
			try {
				const { data, error: fetchError } = await supabase
					.from('notifications')
					.select('*')
					.eq('to', userId)
					.order('created_at', { ascending: false })
					.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

				if (fetchError) throw fetchError

				if (pageNum === 0) {
					setNotifications(data)
				} else {
					setNotifications((prev) => [...prev, ...data])
				}

				setHasMore(data.length === PAGE_SIZE)
				setError(null)
			} catch (err) {
				setError(
					err instanceof Error
						? err
						: new Error('Failed to fetch notifications'),
				)
			} finally {
				setIsLoading(false)
			}
		},
		[supabase, userId],
	)

	const loadMore = useCallback(() => {
		if (!isLoading && hasMore) {
			setPage((prev) => prev + 1)
		}
	}, [isLoading, hasMore])

	const markAsRead = useCallback(
		async (notificationIds: string[]) => {
			try {
				const { error: updateError } = await supabase.rpc(
					'mark_notifications_as_read',
					{ p_notification_ids: notificationIds },
				)

				if (updateError) throw updateError

				setNotifications((prev) =>
					prev.map((notification) =>
						notificationIds.includes(notification.id)
							? { ...notification, read_at: new Date().toISOString() }
							: notification,
					),
				)
			} catch (err) {
				setError(
					err instanceof Error
						? err
						: new Error('Failed to mark notifications as read'),
				)
			}
		},
		[supabase],
	)

	useEffect(() => {
		fetchNotifications(page)
	}, [fetchNotifications, page])

	useEffect(() => {
		const channel = supabase
			.channel('notifications')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'notifications',
					filter: `to=eq.${userId}`,
				},
				(payload) => {
					setNotifications((prev) => [payload.new as Notification, ...prev])
				},
			)
			.subscribe()

		return () => {
			supabase.removeChannel(channel)
		}
	}, [supabase, userId])

	return {
		notifications,
		isLoading,
		error,
		hasMore,
		loadMore,
		markAsRead,
		formatDate: formatNotificationDate,
	}
}
