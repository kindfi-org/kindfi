import type { Database } from '@services/supabase'

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationType = Database['public']['Enums']['notification_type']
export type NotificationMetadata = Database['public']['Tables']['notifications']['Row']['metadata'] 