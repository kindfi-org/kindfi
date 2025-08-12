import { challenges, devices } from '@packages/drizzle'
import type { InferSelectModel } from 'drizzle-orm'

// Re-export the schema tables
export { challenges, devices }

// Infer types from the schema
export type Challenge = InferSelectModel<typeof challenges>
export type Device = InferSelectModel<typeof devices>
