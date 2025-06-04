import { NotificationService } from './notification.service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
	throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
	throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const notificationService = new NotificationService(
	supabaseUrl,
	supabaseAnonKey,
)

export { NotificationService } from './notification.service'
