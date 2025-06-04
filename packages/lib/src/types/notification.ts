import type { Database } from '@services/supabase'

/**
 * Represents a user notification in the system, including its type, message, metadata, and status fields.
 */
export type Notification = Database['public']['Tables']['notifications']['Row']

/**
 * Enum of possible notification types. Should match the database enum values.
 */
export type NotificationType = Database['public']['Enums']['notification_type']

/**
 * Metadata associated with a notification. Structure may vary by notification type.
 */
export type NotificationMetadata =
	Database['public']['Tables']['notifications']['Row']['metadata']
