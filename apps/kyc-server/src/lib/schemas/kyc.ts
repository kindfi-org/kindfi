import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const statusEnum = pgEnum('kyc_status_enum', [
	'pending',
	'approved',
	'rejected',
])
export const verificationEnum = pgEnum('kyc_verification_enum', [
	'basic',
	'enhanced',
])

export const kycStatus = pgTable('kyc_status', {
	id: uuid('id').defaultRandom().primaryKey(),
	user_id: text('user_id').notNull(),
	status: statusEnum('status').notNull().default('pending'),
	verification_level: verificationEnum('verification_level')
		.notNull()
		.default('basic'),
	// This field is maintained by a database trigger defined in the migration
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
})

export type KYCStatus = typeof kycStatus.$inferSelect
export type NewKYCStatus = typeof kycStatus.$inferInsert
