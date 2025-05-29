import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Notification } from '@packages/lib';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const supabase = createClientComponentClient();

  const fetchNotifications = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((pageNum - 1) * 20, pageNum * 20 - 1);

      if (error) throw error;

      const typedData = (data || []) as Notification[];
      const total = count || 0;
      setHasMore(total > pageNum * 20);

      if (pageNum === 1) {
        setNotifications(typedData);
      } else {
        setNotifications(prev => [...prev, ...typedData]);
      }
      setUnreadCount(typedData.filter(n => !n.read_at).length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    try {
      const { error } = await supabase.rpc('mark_notifications_as_read', {
        p_notification_ids: notificationIds
      });

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id)
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );

      setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notifications as read'));
    }
  }, [supabase]);

  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read_at)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      await markAsRead(unreadIds);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark all notifications as read'));
    }
  }, [notifications, markAsRead]);

  useEffect(() => {
    fetchNotifications(page);
  }, [fetchNotifications, page]);

  useEffect(() => {
    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications'
        },
        (payload: RealtimePostgresChangesPayload<Notification>) => {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev =>
            prev.map(n =>
              n.id === updatedNotification.id
                ? { ...n, ...updatedNotification }
                : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    refresh: () => {
      setPage(1);
      fetchNotifications(1);
    }
  };
} 