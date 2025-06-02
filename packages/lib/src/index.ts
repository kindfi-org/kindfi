import type { Database } from '@services/supabase'

export type NotificationType = Database['public']['Enums']['notification_type']
export type NotificationStatus =
	Database['public']['Enums']['notification_status']
export type NotificationMetadata =
	Database['public']['Tables']['notifications']['Row']['metadata']

export * from './doc-utils'
