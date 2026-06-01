import { sql } from 'drizzle-orm'
import {
	boolean,
	foreignKey,
	index,
	integer,
	jsonb,
	pgPolicy,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'
import {
	notificationDeliveryStatus,
	notificationPriority,
	notificationType,
} from './enums'
import {
	usersInAuth,
} from './auth'

export const notificationPreferences = pgTable(
	'notification_preferences',
	{
		userId: uuid('user_id').primaryKey().notNull(),
		email: boolean().default(true),
		push: boolean().default(true),
		inApp: boolean('in_app').default(true),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'notification_preferences_user_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Users can view their own notification preferences', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`(auth.uid() = user_id)`,
		}),
		pgPolicy('Users can update their own notification preferences', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
	],
)

export const notifications = pgTable(
	'notifications',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id').notNull(),
		title: text().notNull(),
		body: text().notNull(),
		type: notificationType().default('info').notNull(),
		priority: notificationPriority().default('medium').notNull(),
		isRead: boolean('is_read').default(false),
		deliveryStatus:
			notificationDeliveryStatus('delivery_status').default('pending'),
		deliveryAttempts: integer('delivery_attempts').default(0),
		nextRetryAt: timestamp('next_retry_at', {
			withTimezone: true,
			mode: 'string',
		}),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }),
		metadata: jsonb().default({}),
		data: jsonb().default({}),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
	},
	(table) => [
		index('notifications_created_at_idx').using(
			'btree',
			table.createdAt.asc().nullsLast().op('timestamptz_ops'),
		),
		index('notifications_is_read_idx').using(
			'btree',
			table.isRead.asc().nullsLast().op('bool_ops'),
		),
		index('notifications_user_id_idx').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'notifications_user_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Users can view their own notifications', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`(auth.uid() = user_id)`,
		}),
		pgPolicy('Users can update their own notifications', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Users can delete their own notifications', {
			as: 'permissive',
			for: 'delete',
			to: ['public'],
		}),
		pgPolicy('Users can create their own notifications', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
		}),
	],
)
