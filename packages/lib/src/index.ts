import type { Database } from '@services/supabase'

export type NotificationType = Database['public']['Enums']['notification_type']
export type NotificationMetadata =
	Database['public']['Tables']['notifications']['Row']['metadata']

export type Notification = Database['public']['Tables']['notifications']['Row']

export * from './doc-utils'
export * from './hooks'
