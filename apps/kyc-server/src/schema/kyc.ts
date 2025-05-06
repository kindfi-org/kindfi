import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const kycStatus = pgTable('kyc_status', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').notNull(),
  status: text('status').notNull().default('pending'),
  verification_level: text('verification_level').notNull().default('basic'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export type KYCStatus = typeof kycStatus.$inferSelect
export type NewKYCStatus = typeof kycStatus.$inferInsert 