import { NotificationService } from './notification.service'

export const notificationService = new NotificationService(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export { NotificationService } from './notification.service'
