import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import type { Database } from '../types/supabase';
import { NotificationSchema, type Notification, type CreateNotification } from '../types/notification';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; 

export class NotificationService {
  private supabase;
  private queue: Array<{ notification: CreateNotification; retries: number }> = [];
  private isProcessing = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  private async hashMetadata(metadata: Record<string, unknown>): Promise<string> {
    const metadataString = JSON.stringify(metadata);
    return createHash('sha256')
      .update(metadataString)
      .digest('hex');
  }

  private async validateNotification(notification: CreateNotification): Promise<void> {
    try {
      await NotificationSchema.parseAsync(notification);
    } catch (error) {
      throw new Error(`Invalid notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createNotificationInDB(notification: CreateNotification): Promise<Notification> {
    const { data, error } = await this.supabase
      .from('notifications')
      .insert({
        ...notification,
        metadata_hash: await this.hashMetadata(notification.metadata),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const item = this.queue[0];

    try {
      await this.validateNotification(item.notification);
      await this.createNotificationInDB(item.notification);
      this.queue.shift();
    } catch (error) {
      console.error('Error processing notification:', error);
      
      if (item.retries < MAX_RETRIES) {
        item.retries++;
        setTimeout(() => {
          this.isProcessing = false;
          this.processQueue();
        }, RETRY_DELAY * item.retries);
      } else {
        this.queue.shift(); // Remove failed item after max retries
        // TODO: Implement dead letter queue or error reporting
      }
    }

    this.isProcessing = false;
    if (this.queue.length > 0) {
      this.processQueue();
    }
  }

  public async createNotification(notification: CreateNotification): Promise<Notification> {
    try {
      await this.validateNotification(notification);
      this.queue.push({ notification, retries: 0 });
      await this.processQueue();
      return await this.createNotificationInDB(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  public async markAsRead(notificationIds: string[]): Promise<void> {
    const { error } = await this.supabase.rpc('mark_notifications_as_read', {
      p_notification_ids: notificationIds,
    });

    if (error) throw error;
  }

  public async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('to', userId)
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  }

  public async getNotifications(
    userId: string,
    page = 1,
    pageSize = 20
  ): Promise<{ notifications: Notification[]; hasMore: boolean }> {
    const { data, error, count } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('to', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    const total = count || 0;
    const hasMore = total > page * pageSize;

    return {
      notifications: data || [],
      hasMore,
    };
  }

  public subscribeToNotifications(
    userId: string,
    callback: (notification: Notification) => void
  ): () => void {
    const channel = this.supabase
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
          try {
            const notification = NotificationSchema.parse(payload.new);
            callback(notification);
          } catch (error) {
            console.error('Error parsing notification:', error);
          }
        }
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }
} 