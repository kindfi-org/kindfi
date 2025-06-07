import { z } from 'zod'

const envSchema = z.object({
	// VAPID Configuration
	VAPID_EMAIL: z.string().email(),
	VAPID_PRIVATE_KEY: z.string().min(1),
	NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1),

	// Supabase Configuration
	NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)

// Type for the validated environment variables
export type Env = z.infer<typeof envSchema>
