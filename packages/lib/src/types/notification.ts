import { z } from 'zod';

export const NotificationType = {
  PROJECT_UPDATE: 'project_update',
  MILESTONE_COMPLETED: 'milestone_completed',
  ESCROW_RELEASED: 'escrow_released',
  KYC_STATUS_CHANGE: 'kyc_status_change',
  COMMENT_ADDED: 'comment_added',
  MEMBER_JOINED: 'member_joined',
  SYSTEM_ALERT: 'system_alert',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum([
    NotificationType.PROJECT_UPDATE,
    NotificationType.MILESTONE_COMPLETED,
    NotificationType.ESCROW_RELEASED,
    NotificationType.KYC_STATUS_CHANGE,
    NotificationType.COMMENT_ADDED,
    NotificationType.MEMBER_JOINED,
    NotificationType.SYSTEM_ALERT,
  ]),
  message: z.string(),
  from: z.string().uuid().nullable(),
  to: z.string().uuid(),
  metadata: z.record(z.unknown()),
  metadata_hash: z.string(),
  created_at: z.string().datetime(),
  read_at: z.string().datetime().nullable(),
  delivery_status: z.enum(['pending', 'delivered', 'failed']).default('pending'),
  retry_count: z.number().default(0),
});

export type Notification = z.infer<typeof NotificationSchema>;

export const CreateNotificationSchema = z.object({
  type: NotificationSchema.shape.type,
  message: NotificationSchema.shape.message,
  from: NotificationSchema.shape.from,
  to: NotificationSchema.shape.to,
  metadata: NotificationSchema.shape.metadata,
});

export type CreateNotification = z.infer<typeof CreateNotificationSchema>;

export const MarkNotificationsAsReadSchema = z.object({
  notificationIds: z.array(z.string().uuid()),
});

export type MarkNotificationsAsRead = z.infer<typeof MarkNotificationsAsReadSchema>;

// i18n message codes
export const NotificationMessages = {
  [NotificationType.PROJECT_UPDATE]: 'notifications.project_update',
  [NotificationType.MILESTONE_COMPLETED]: 'notifications.milestone_completed',
  [NotificationType.ESCROW_RELEASED]: 'notifications.escrow_released',
  [NotificationType.KYC_STATUS_CHANGE]: 'notifications.kyc_status_change',
  [NotificationType.COMMENT_ADDED]: 'notifications.comment_added',
  [NotificationType.MEMBER_JOINED]: 'notifications.member_joined',
  [NotificationType.SYSTEM_ALERT]: 'notifications.system_alert',
} as const; 