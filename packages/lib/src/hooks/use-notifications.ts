import { useCallback, useEffect, useState } from 'react'
import type { Database } from '../types/supabase'
import { useSupabase } from './use-supabase'

type Notification = Database['public']['Tables']['notifications']['Row']

export function useNotifications() {
	const { supabase } = useSupabase()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	const [hasMore, setHasMore] = useState(true)
	const [page, setPage] = useState(0)
	const PAGE_SIZE = 20
	const [paginationLoading, setPaginationLoading] = useState(false)

	const fetchNotifications = useCallback(
		async (pageNum: number) => {
			try {
				const { data, error: fetchError } = await supabase
					.from('notifications')
					.select('*')
					.order('created_at', { ascending: false })
					.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1)

				if (fetchError) throw fetchError

				setNotifications((prev) => (pageNum === 0 ? data : [...prev, ...data]))
				setHasMore(data.length === PAGE_SIZE)
				setPage(pageNum)
			} catch (err) {
				setError(
					err instanceof Error
						? err
						: new Error('Failed to fetch notifications'),
				)
			} finally {
				setIsLoading(false)
				setPaginationLoading(false)
			}
		},
		[supabase],
	)

	const loadMore = useCallback(() => {
		if (!paginationLoading && hasMore) {
			setPaginationLoading(true)
			fetchNotifications(page + 1)
		}
	}, [fetchNotifications, hasMore, paginationLoading, page])

	const markAsRead = useCallback(
		async (notificationIds: string[]) => {
			try {
				const { error: updateError } = await supabase
					.from('notifications')
					.update({ read_at: null })
					.in('id', notificationIds)

				if (updateError) throw updateError

				setNotifications((prev) =>
					prev.map((notification) =>
						notificationIds.includes(notification.id)
							? { ...notification, read_at: 'now()' }
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

	const markAllAsRead = useCallback(async () => {
		try {
			const { error: updateError } = await supabase
				.from('notifications')
				.update({ read_at: 'now()' })
				.is('read_at', null)

			if (updateError) throw updateError

			setNotifications((prev) =>
				prev.map((notification) => ({
					...notification,
					read_at: 'now()',
				})),
			)
		} catch (err) {
			setError(
				err instanceof Error
					? err
					: new Error('Failed to mark all notifications as read'),
			)
		}
	}, [supabase])

	const refresh = useCallback(() => {
		setIsLoading(true)
		fetchNotifications(0)
	}, [fetchNotifications])

	useEffect(() => {
		fetchNotifications(0)
	}, [fetchNotifications])

	return {
		notifications,
		isLoading,
		error,
		hasMore,
		loadMore,
		markAsRead,
		markAllAsRead,
		refresh,
	}
}
