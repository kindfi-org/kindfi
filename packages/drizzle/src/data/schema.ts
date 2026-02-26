import { sql } from 'drizzle-orm'
import {
	bigint,
	bigserial,
	boolean,
	char,
	check,
	foreignKey,
	index,
	inet,
	integer,
	json,
	jsonb,
	numeric,
	pgEnum,
	pgPolicy,
	pgSchema,
	pgTable,
	primaryKey,
	smallint,
	text,
	timestamp,
	unique,
	uniqueIndex,
	uuid,
	varchar,
} from 'drizzle-orm/pg-core'

export const auth = pgSchema('auth')
export const nextAuth = pgSchema('next_auth')
export const aalLevelInAuth = auth.enum('aal_level', ['aal1', 'aal2', 'aal3'])
export const codeChallengeMethodInAuth = auth.enum('code_challenge_method', [
	's256',
	'plain',
])
export const factorStatusInAuth = auth.enum('factor_status', [
	'unverified',
	'verified',
])
export const factorTypeInAuth = auth.enum('factor_type', [
	'totp',
	'webauthn',
	'phone',
])
export const oneTimeTokenTypeInAuth = auth.enum('one_time_token_type', [
	'confirmation_token',
	'reauthentication_token',
	'recovery_token',
	'email_change_token_new',
	'email_change_token_current',
	'phone_change_token',
])
export const backupState = pgEnum('backup_state', [
	'not_backed_up',
	'backed_up',
])
export const commentType = pgEnum('comment_type', [
	'comment',
	'question',
	'answer',
])
export const credentialType = pgEnum('credential_type', ['public-key'])
export const deviceType = pgEnum('device_type', [
	'single_device',
	'multi_device',
])
export const escrowStatusType = pgEnum('escrow_status_type', [
	'NEW',
	'FUNDED',
	'ACTIVE',
	'COMPLETED',
	'DISPUTED',
	'CANCELLED',
])
export const kycStatusEnum = pgEnum('kyc_status_enum', [
	'pending',
	'approved',
	'rejected',
	'verified',
])
export const kycVerificationEnum = pgEnum('kyc_verification_enum', [
	'basic',
	'enhanced',
])
export const milestoneStatus = pgEnum('milestone_status', [
	'pending',
	'completed',
	'approved',
	'rejected',
	'disputed',
])
export const notificationDeliveryStatus = pgEnum(
	'notification_delivery_status',
	['pending', 'delivered', 'failed'],
)
export const notificationPriority = pgEnum('notification_priority', [
	'low',
	'medium',
	'high',
	'urgent',
])
export const notificationType = pgEnum('notification_type', [
	'info',
	'success',
	'warning',
	'error',
])
export const profileVerificationStatus = pgEnum('profile_verification_status', [
	'unverified',
	'verified',
])
export const projectMemberRole = pgEnum('project_member_role', [
	'admin',
	'editor',
	'advisor',
	'community',
	'core',
	'others',
])
export const projectStatus = pgEnum('project_status', [
	'draft',
	'review',
	'active',
	'paused',
	'funded',
	'rejected',
])
export const userRole = pgEnum('user_role', ['kinder', 'kindler'])

export const schemaMigrationsInAuth = auth.table('schema_migrations', {
	version: varchar({ length: 255 }).primaryKey().notNull(),
})

export const instancesInAuth = auth.table('instances', {
	id: uuid().primaryKey().notNull(),
	uuid: uuid(),
	rawBaseConfig: text('raw_base_config'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
})

export const usersInAuth = auth.table(
	'users',
	{
		instanceId: uuid('instance_id'),
		id: uuid().primaryKey().notNull(),
		aud: varchar({ length: 255 }),
		role: varchar({ length: 255 }),
		email: varchar({ length: 255 }),
		encryptedPassword: varchar('encrypted_password', { length: 255 }),
		emailConfirmedAt: timestamp('email_confirmed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		invitedAt: timestamp('invited_at', { withTimezone: true, mode: 'string' }),
		confirmationToken: varchar('confirmation_token', { length: 255 }),
		confirmationSentAt: timestamp('confirmation_sent_at', {
			withTimezone: true,
			mode: 'string',
		}),
		recoveryToken: varchar('recovery_token', { length: 255 }),
		recoverySentAt: timestamp('recovery_sent_at', {
			withTimezone: true,
			mode: 'string',
		}),
		emailChangeTokenNew: varchar('email_change_token_new', { length: 255 }),
		emailChange: varchar('email_change', { length: 255 }),
		emailChangeSentAt: timestamp('email_change_sent_at', {
			withTimezone: true,
			mode: 'string',
		}),
		lastSignInAt: timestamp('last_sign_in_at', {
			withTimezone: true,
			mode: 'string',
		}),
		rawAppMetaData: jsonb('raw_app_meta_data'),
		rawUserMetaData: jsonb('raw_user_meta_data'),
		isSuperAdmin: boolean('is_super_admin'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		phone: text().default(sql`NULL`),
		phoneConfirmedAt: timestamp('phone_confirmed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		phoneChange: text('phone_change').default(''),
		phoneChangeToken: varchar('phone_change_token', { length: 255 }).default(
			'',
		),
		phoneChangeSentAt: timestamp('phone_change_sent_at', {
			withTimezone: true,
			mode: 'string',
		}),
		confirmedAt: timestamp('confirmed_at', {
			withTimezone: true,
			mode: 'string',
		}).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
		emailChangeTokenCurrent: varchar('email_change_token_current', {
			length: 255,
		}).default(''),
		emailChangeConfirmStatus: smallint('email_change_confirm_status').default(
			0,
		),
		bannedUntil: timestamp('banned_until', {
			withTimezone: true,
			mode: 'string',
		}),
		reauthenticationToken: varchar('reauthentication_token', {
			length: 255,
		}).default(''),
		reauthenticationSentAt: timestamp('reauthentication_sent_at', {
			withTimezone: true,
			mode: 'string',
		}),
		isSsoUser: boolean('is_sso_user').default(false).notNull(),
		deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
		isAnonymous: boolean('is_anonymous').default(false).notNull(),
	},
	(table) => [
		uniqueIndex('confirmation_token_idx')
			.using('btree', table.confirmationToken.asc().nullsLast().op('text_ops'))
			.where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex('email_change_token_current_idx')
			.using(
				'btree',
				table.emailChangeTokenCurrent.asc().nullsLast().op('text_ops'),
			)
			.where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex('email_change_token_new_idx')
			.using(
				'btree',
				table.emailChangeTokenNew.asc().nullsLast().op('text_ops'),
			)
			.where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex('reauthentication_token_idx')
			.using(
				'btree',
				table.reauthenticationToken.asc().nullsLast().op('text_ops'),
			)
			.where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex('recovery_token_idx')
			.using('btree', table.recoveryToken.asc().nullsLast().op('text_ops'))
			.where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex('users_email_partial_key')
			.using('btree', table.email.asc().nullsLast().op('text_ops'))
			.where(sql`(is_sso_user = false)`),
		index('users_instance_id_email_idx').using(
			'btree',
			sql`instance_id`,
			sql`lower((email)::text)`,
		),
		index('users_instance_id_idx').using(
			'btree',
			table.instanceId.asc().nullsLast().op('uuid_ops'),
		),
		index('users_is_anonymous_idx').using(
			'btree',
			table.isAnonymous.asc().nullsLast().op('bool_ops'),
		),
		unique('users_phone_key').on(table.phone),
		check(
			'users_email_change_confirm_status_check',
			sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`,
		),
	],
)

export const auditLogEntriesInAuth = auth.table(
	'audit_log_entries',
	{
		instanceId: uuid('instance_id'),
		id: uuid().primaryKey().notNull(),
		payload: json(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		ipAddress: varchar('ip_address', { length: 64 }).default('').notNull(),
	},
	(table) => [
		index('audit_logs_instance_id_idx').using(
			'btree',
			table.instanceId.asc().nullsLast().op('uuid_ops'),
		),
	],
)

export const refreshTokensInAuth = auth.table(
	'refresh_tokens',
	{
		instanceId: uuid('instance_id'),
		id: bigserial({ mode: 'bigint' }).primaryKey().notNull(),
		token: varchar({ length: 255 }),
		userId: varchar('user_id', { length: 255 }),
		revoked: boolean(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		parent: varchar({ length: 255 }),
		sessionId: uuid('session_id'),
	},
	(table) => [
		index('refresh_tokens_instance_id_idx').using(
			'btree',
			table.instanceId.asc().nullsLast().op('uuid_ops'),
		),
		index('refresh_tokens_instance_id_user_id_idx').using(
			'btree',
			table.instanceId.asc().nullsLast().op('text_ops'),
			table.userId.asc().nullsLast().op('text_ops'),
		),
		index('refresh_tokens_parent_idx').using(
			'btree',
			table.parent.asc().nullsLast().op('text_ops'),
		),
		index('refresh_tokens_session_id_revoked_idx').using(
			'btree',
			table.sessionId.asc().nullsLast().op('bool_ops'),
			table.revoked.asc().nullsLast().op('bool_ops'),
		),
		index('refresh_tokens_updated_at_idx').using(
			'btree',
			table.updatedAt.desc().nullsFirst().op('timestamptz_ops'),
		),
		foreignKey({
			columns: [table.sessionId],
			foreignColumns: [sessionsInAuth.id],
			name: 'refresh_tokens_session_id_fkey',
		}).onDelete('cascade'),
		unique('refresh_tokens_token_unique').on(table.token),
	],
)

export const sessionsInAuth = auth.table(
	'sessions',
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid('user_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		factorId: uuid('factor_id'),
		aal: aalLevelInAuth(),
		notAfter: timestamp('not_after', { withTimezone: true, mode: 'string' }),
		refreshedAt: timestamp('refreshed_at', { mode: 'string' }),
		userAgent: text('user_agent'),
		ip: inet(),
		tag: text(),
	},
	(table) => [
		index('sessions_not_after_idx').using(
			'btree',
			table.notAfter.desc().nullsFirst().op('timestamptz_ops'),
		),
		index('sessions_user_id_idx').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		index('user_id_created_at_idx').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
			table.createdAt.asc().nullsLast().op('timestamptz_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'sessions_user_id_fkey',
		}).onDelete('cascade'),
	],
)

export const identitiesInAuth = auth.table(
	'identities',
	{
		providerId: text('provider_id').notNull(),
		userId: uuid('user_id').notNull(),
		identityData: jsonb('identity_data').notNull(),
		provider: text().notNull(),
		lastSignInAt: timestamp('last_sign_in_at', {
			withTimezone: true,
			mode: 'string',
		}),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		email: text().generatedAlwaysAs(
			sql`lower((identity_data ->> 'email'::text))`,
		),
		id: uuid().defaultRandom().primaryKey().notNull(),
	},
	(table) => [
		index('identities_email_idx').using(
			'btree',
			table.email.asc().nullsLast().op('text_pattern_ops'),
		),
		index('identities_user_id_idx').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'identities_user_id_fkey',
		}).onDelete('cascade'),
		unique('identities_provider_id_provider_unique').on(
			table.providerId,
			table.provider,
		),
	],
)

export const mfaFactorsInAuth = auth.table(
	'mfa_factors',
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid('user_id').notNull(),
		friendlyName: text('friendly_name'),
		factorType: factorTypeInAuth('factor_type').notNull(),
		status: factorStatusInAuth().notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).notNull(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).notNull(),
		secret: text(),
		phone: text(),
		lastChallengedAt: timestamp('last_challenged_at', {
			withTimezone: true,
			mode: 'string',
		}),
		webAuthnCredential: jsonb('web_authn_credential'),
		webAuthnAaguid: uuid('web_authn_aaguid'),
	},
	(table) => [
		index('factor_id_created_at_idx').using(
			'btree',
			table.userId.asc().nullsLast().op('timestamptz_ops'),
			table.createdAt.asc().nullsLast().op('uuid_ops'),
		),
		uniqueIndex('mfa_factors_user_friendly_name_unique')
			.using(
				'btree',
				table.friendlyName.asc().nullsLast().op('text_ops'),
				table.userId.asc().nullsLast().op('uuid_ops'),
			)
			.where(sql`(TRIM(BOTH FROM friendly_name) <> ''::text)`),
		index('mfa_factors_user_id_idx').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		uniqueIndex('unique_phone_factor_per_user').using(
			'btree',
			table.userId.asc().nullsLast().op('text_ops'),
			table.phone.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'mfa_factors_user_id_fkey',
		}).onDelete('cascade'),
		unique('mfa_factors_last_challenged_at_key').on(table.lastChallengedAt),
	],
)

export const mfaChallengesInAuth = auth.table(
	'mfa_challenges',
	{
		id: uuid().primaryKey().notNull(),
		factorId: uuid('factor_id').notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).notNull(),
		verifiedAt: timestamp('verified_at', {
			withTimezone: true,
			mode: 'string',
		}),
		ipAddress: inet('ip_address').notNull(),
		otpCode: text('otp_code'),
		webAuthnSessionData: jsonb('web_authn_session_data'),
	},
	(table) => [
		index('mfa_challenge_created_at_idx').using(
			'btree',
			table.createdAt.desc().nullsFirst().op('timestamptz_ops'),
		),
		foreignKey({
			columns: [table.factorId],
			foreignColumns: [mfaFactorsInAuth.id],
			name: 'mfa_challenges_auth_factor_id_fkey',
		}).onDelete('cascade'),
	],
)

export const ssoProvidersInAuth = auth.table(
	'sso_providers',
	{
		id: uuid().primaryKey().notNull(),
		resourceId: text('resource_id'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		disabled: boolean(),
	},
	(table) => [
		uniqueIndex('sso_providers_resource_id_idx').using(
			'btree',
			sql`lower(resource_id)`,
		),
		index('sso_providers_resource_id_pattern_idx').using(
			'btree',
			table.resourceId.asc().nullsLast().op('text_pattern_ops'),
		),
		check(
			'resource_id not empty',
			sql`(resource_id = NULL::text) OR (char_length(resource_id) > 0)`,
		),
	],
)

export const ssoDomainsInAuth = auth.table(
	'sso_domains',
	{
		id: uuid().primaryKey().notNull(),
		ssoProviderId: uuid('sso_provider_id').notNull(),
		domain: text().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
	},
	(table) => [
		uniqueIndex('sso_domains_domain_idx').using('btree', sql`lower(domain)`),
		index('sso_domains_sso_provider_id_idx').using(
			'btree',
			table.ssoProviderId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: 'sso_domains_sso_provider_id_fkey',
		}).onDelete('cascade'),
		check('domain not empty', sql`char_length(domain) > 0`),
	],
)

export const samlRelayStatesInAuth = auth.table(
	'saml_relay_states',
	{
		id: uuid().primaryKey().notNull(),
		ssoProviderId: uuid('sso_provider_id').notNull(),
		requestId: text('request_id').notNull(),
		forEmail: text('for_email'),
		redirectTo: text('redirect_to'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		flowStateId: uuid('flow_state_id'),
	},
	(table) => [
		index('saml_relay_states_created_at_idx').using(
			'btree',
			table.createdAt.desc().nullsFirst().op('timestamptz_ops'),
		),
		index('saml_relay_states_for_email_idx').using(
			'btree',
			table.forEmail.asc().nullsLast().op('text_ops'),
		),
		index('saml_relay_states_sso_provider_id_idx').using(
			'btree',
			table.ssoProviderId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: 'saml_relay_states_sso_provider_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.flowStateId],
			foreignColumns: [flowStateInAuth.id],
			name: 'saml_relay_states_flow_state_id_fkey',
		}).onDelete('cascade'),
		check('request_id not empty', sql`char_length(request_id) > 0`),
	],
)

export const mfaAmrClaimsInAuth = auth.table(
	'mfa_amr_claims',
	{
		sessionId: uuid('session_id').notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).notNull(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).notNull(),
		authenticationMethod: text('authentication_method').notNull(),
		id: uuid().primaryKey().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.sessionId],
			foreignColumns: [sessionsInAuth.id],
			name: 'mfa_amr_claims_session_id_fkey',
		}).onDelete('cascade'),
		unique('mfa_amr_claims_session_id_authentication_method_pkey').on(
			table.sessionId,
			table.authenticationMethod,
		),
	],
)

export const samlProvidersInAuth = auth.table(
	'saml_providers',
	{
		id: uuid().primaryKey().notNull(),
		ssoProviderId: uuid('sso_provider_id').notNull(),
		entityId: text('entity_id').notNull(),
		metadataXml: text('metadata_xml').notNull(),
		metadataUrl: text('metadata_url'),
		attributeMapping: jsonb('attribute_mapping'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		nameIdFormat: text('name_id_format'),
	},
	(table) => [
		index('saml_providers_sso_provider_id_idx').using(
			'btree',
			table.ssoProviderId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.ssoProviderId],
			foreignColumns: [ssoProvidersInAuth.id],
			name: 'saml_providers_sso_provider_id_fkey',
		}).onDelete('cascade'),
		unique('saml_providers_entity_id_key').on(table.entityId),
		check('metadata_xml not empty', sql`char_length(metadata_xml) > 0`),
		check(
			'metadata_url not empty',
			sql`(metadata_url = NULL::text) OR (char_length(metadata_url) > 0)`,
		),
		check('entity_id not empty', sql`char_length(entity_id) > 0`),
	],
)

export const flowStateInAuth = auth.table(
	'flow_state',
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid('user_id'),
		authCode: text('auth_code').notNull(),
		codeChallengeMethod: codeChallengeMethodInAuth(
			'code_challenge_method',
		).notNull(),
		codeChallenge: text('code_challenge').notNull(),
		providerType: text('provider_type').notNull(),
		providerAccessToken: text('provider_access_token'),
		providerRefreshToken: text('provider_refresh_token'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }),
		authenticationMethod: text('authentication_method').notNull(),
		authCodeIssuedAt: timestamp('auth_code_issued_at', {
			withTimezone: true,
			mode: 'string',
		}),
	},
	(table) => [
		index('flow_state_created_at_idx').using(
			'btree',
			table.createdAt.desc().nullsFirst().op('timestamptz_ops'),
		),
		index('idx_auth_code').using(
			'btree',
			table.authCode.asc().nullsLast().op('text_ops'),
		),
		index('idx_user_id_auth_method').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
			table.authenticationMethod.asc().nullsLast().op('uuid_ops'),
		),
	],
)

export const oneTimeTokensInAuth = auth.table(
	'one_time_tokens',
	{
		id: uuid().primaryKey().notNull(),
		userId: uuid('user_id').notNull(),
		tokenType: oneTimeTokenTypeInAuth('token_type').notNull(),
		tokenHash: text('token_hash').notNull(),
		relatesTo: text('relates_to').notNull(),
		createdAt: timestamp('created_at', { mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('one_time_tokens_relates_to_hash_idx').using(
			'hash',
			table.relatesTo.asc().nullsLast().op('text_ops'),
		),
		index('one_time_tokens_token_hash_hash_idx').using(
			'hash',
			table.tokenHash.asc().nullsLast().op('text_ops'),
		),
		uniqueIndex('one_time_tokens_user_id_token_type_key').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
			table.tokenType.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'one_time_tokens_user_id_fkey',
		}).onDelete('cascade'),
		check('one_time_tokens_token_hash_check', sql`char_length(token_hash) > 0`),
	],
)

export const escrowReviews = pgTable(
	'escrow_reviews',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		escrowId: uuid('escrow_id').notNull(),
		milestoneId: uuid('milestone_id'),
		reviewerAddress: text('reviewer_address').notNull(),
		status: text().default('PENDING').notNull(),
		reviewNotes: text('review_notes'),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		reviewedAt: timestamp('reviewed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		disputerId: uuid('disputer_id'),
		type: text().notNull(),
		resolutionText: text('resolution_text'),
		evidenceUrls: text('evidence_urls').array(),
		transactionHash: text('transaction_hash'),
	},
	(table) => [
		index('escrow_reviews_escrow_id_idx').using(
			'btree',
			table.escrowId.asc().nullsLast().op('uuid_ops'),
		),
		index('escrow_reviews_milestone_id_idx').using(
			'btree',
			table.milestoneId.asc().nullsLast().op('uuid_ops'),
		),
		index('escrow_reviews_type_idx').using(
			'btree',
			table.type.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.escrowId],
			foreignColumns: [escrowContracts.id],
			name: 'escrow_reviews_escrow_id_fkey',
		}),
		foreignKey({
			columns: [table.milestoneId],
			foreignColumns: [milestones.id],
			name: 'escrow_reviews_milestone_id_fkey',
		}),
		check(
			'escrow_reviews_type_check',
			sql`type = ANY (ARRAY['dispute'::text, 'milestone'::text])`,
		),
	],
)

export const profiles = pgTable(
	'profiles',
	{
		id: uuid().primaryKey().notNull(),
		role: userRole().default('kindler').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		displayName: text('display_name').default(''),
		bio: text().default(''),
		imageUrl: text('image_url').default(''),
		email: text(),
		nextAuthUserId: uuid('next_auth_user_id'),
		slug: text('slug'),
	},
	(table) => [
		uniqueIndex('profiles_slug_key').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		index('idx_profiles_next_auth_user_id').using(
			'btree',
			table.nextAuthUserId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.id],
			foreignColumns: [usersInAuth.id],
			name: 'profiles_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.nextAuthUserId],
			foreignColumns: [usersInNextAuth.id],
			name: 'profiles_next_auth_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.id],
			foreignColumns: [usersInNextAuth.id],
			name: 'profiles_id_fkey1',
		})
			.onUpdate('cascade')
			.onDelete('cascade'),
		pgPolicy('Public read access to profiles', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Users can insert their own profile', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Users can update their own profile', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('Users can view their own profile via NextAuth', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
		pgPolicy('Users can update their own profile via NextAuth', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Service role can manage all profiles', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
		}),
	],
)

export const escrowStatus = pgTable(
	'escrow_status',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		escrowId: text('escrow_id').notNull(),
		status: escrowStatusType().notNull(),
		currentMilestone: integer('current_milestone'),
		totalFunded: numeric('total_funded', { precision: 20, scale: 7 }),
		totalReleased: numeric('total_released', { precision: 20, scale: 7 }),
		lastUpdated: timestamp('last_updated', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		metadata: jsonb().default({}),
	},
	(table) => [
		index('idx_escrow_status_escrow_id').using(
			'btree',
			table.escrowId.asc().nullsLast().op('text_ops'),
		),
		index('idx_escrow_status_last_updated').using(
			'btree',
			table.lastUpdated.asc().nullsLast().op('timestamptz_ops'),
		),
		index('idx_escrow_status_metadata').using(
			'gin',
			table.metadata.asc().nullsLast().op('jsonb_ops'),
		),
		index('idx_escrow_status_status').using(
			'btree',
			table.status.asc().nullsLast().op('enum_ops'),
		),
		check('valid_amounts', sql`total_funded >= total_released`),
	],
)

export const contributions = pgTable(
	'contributions',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		contributorId: uuid('contributor_id').notNull(),
		amount: numeric({ precision: 20, scale: 7 }).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'contributions_project_id_fkey',
		}),
	],
)

export const escrowContracts = pgTable(
	'escrow_contracts',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		engagementId: text('engagement_id').notNull(),
		contractId: text('contract_id').notNull(),
		projectId: uuid('project_id').notNull(),
		contributionId: uuid('contribution_id').notNull(),
		payerAddress: text('payer_address').notNull(),
		receiverAddress: text('receiver_address').notNull(),
		amount: numeric({ precision: 20, scale: 7 }).notNull(),
		currentState: escrowStatusType('current_state').default('NEW').notNull(),
		platformFee: numeric('platform_fee', { precision: 5, scale: 2 }).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		completedAt: timestamp('completed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		metadata: jsonb().default({}),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'escrow_contracts_project_id_fkey',
		}),
		foreignKey({
			columns: [table.contributionId],
			foreignColumns: [contributions.id],
			name: 'escrow_contracts_contribution_id_fkey',
		}),
		unique('escrow_contracts_engagement_id_key').on(table.engagementId),
		unique('escrow_contracts_contract_id_key').on(table.contractId),
		pgPolicy('public_select_escrow_contracts', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		check('valid_escrow_amount', sql`amount > (0)::numeric`),
		check('valid_platform_fee', sql`platform_fee >= (0)::numeric`),
	],
)

export const projectUpdates = pgTable(
	'project_updates',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		authorId: uuid('author_id').notNull(),
		title: text().notNull(),
		content: text().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_project_updates_author_id').using(
			'btree',
			table.authorId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_project_updates_project_id').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_updates_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.authorId],
			foreignColumns: [usersInAuth.id],
			name: 'project_updates_author_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Public read access to project updates', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Project updates can be created by project members', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Project updates can be modified by authors', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('Project updates can be deleted by authors or project owners', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const projectPitch = pgTable(
	'project_pitch',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		title: text().notNull(),
		story: text().notNull(),
		pitchDeck: text('pitch_deck'),
		videoUrl: text('video_url'),
		projectId: uuid('project_id').notNull(),
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
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_pitch_project_id_fkey',
		}).onDelete('cascade'),
		unique('project_pitch_project_id_key').on(table.projectId),
		pgPolicy('Public read access to project pitches', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Temporary public insert access to project pitches', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
		}),
		pgPolicy('Temporary public update access to project pitches', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Users can delete their own project pitches', {
			as: 'permissive',
			for: 'delete',
			to: ['public'],
		}),
	],
)

export const projects = pgTable(
	'projects',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		title: text().notNull(),
		description: text().notNull(),
		currentAmount: numeric('current_amount', { precision: 12, scale: 2 })
			.default('0')
			.notNull(),
		targetAmount: numeric('target_amount', {
			precision: 12,
			scale: 2,
		}).notNull(),
		minInvestment: numeric('min_investment', {
			precision: 12,
			scale: 2,
		}).notNull(),
		percentageComplete: numeric('percentage_complete', {
			precision: 5,
			scale: 2,
		})
			.default('0')
			.notNull(),
		kinderCount: integer('kinder_count').default(0).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		categoryId: uuid('category_id').notNull(),
		imageUrl: text('image_url'),
		kindlerId: uuid('kindler_id').notNull(),
		slug: text(),
		socialLinks: jsonb('social_links').default({}).notNull(),
		projectLocation: char('project_location', { length: 3 }).notNull(),
		status: projectStatus().default('draft').notNull(),
		metadata: jsonb().default({}).notNull(),
		foundationId: uuid('foundation_id'),
	},
	(table) => [
		index('idx_projects_kindler_id').using(
			'btree',
			table.kindlerId.asc().nullsLast().op('uuid_ops'),
		),
		index('projects_project_location_idx').using(
			'btree',
			table.projectLocation.asc().nullsLast().op('bpchar_ops'),
		),
		uniqueIndex('projects_slug_key').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		index('projects_status_idx').using(
			'btree',
			table.status.asc().nullsLast().op('enum_ops'),
		),
		foreignKey({
			columns: [table.kindlerId],
			foreignColumns: [usersInAuth.id],
			name: 'projects_kindler_id_fkey',
		}),
		foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: 'projects_category_id_fkey',
		}).onDelete('set null'),
		index('idx_projects_foundation_id').using(
			'btree',
			table.foundationId.asc().nullsLast().op('uuid_ops'),
		),
		pgPolicy('Public read access to projects', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Temporary public insert access to projects', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
		}),
		pgPolicy('Temporary public update access to projects', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Projects can be deleted by owner', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
		check(
			'check_min_investment_less_than_target',
			sql`min_investment <= target_amount`,
		),
		check('check_positive_target_amount', sql`target_amount > (0)::numeric`),
		check(
			'chk_project_location_alpha3',
			sql`project_location ~ '^[A-Z]{3}$'::text`,
		),
	],
)

export const community = pgTable(
	'community',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		updateId: uuid('update_id').notNull(),
		commentId: uuid('comment_id').notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
	},
	(table) => [
		index('community_project_id_idx').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		index('community_update_id_idx').using(
			'btree',
			table.updateId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'community_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.updateId],
			foreignColumns: [projectUpdates.id],
			name: 'community_update_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.commentId],
			foreignColumns: [comments.id],
			name: 'comment_id_fkey',
		}).onDelete('cascade'),
	],
)

export const projectMembers = pgTable(
	'project_members',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		projectId: uuid('project_id').notNull(),
		userId: uuid('user_id').notNull(),
		role: projectMemberRole().default('editor').notNull(),
		joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		title: text().default('').notNull(),
	},
	(table) => [
		index('idx_project_members_project_id').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_project_members_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_members_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'project_members_user_id_fkey',
		}).onDelete('cascade'),
		unique('project_members_project_id_user_id_key').on(
			table.projectId,
			table.userId,
		),
		pgPolicy('Public read access to project members', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Project owners can add members', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Project owners can remove members', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
		pgPolicy('Project owners can update member roles', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
	],
)

export const milestones = pgTable(
	'milestones',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		title: text().notNull(),
		description: text(),
		amount: numeric({ precision: 20, scale: 7 }).notNull(),
		deadline: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
		status: milestoneStatus().default('pending').notNull(),
		orderIndex: integer('order_index').notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).default(sql`CURRENT_TIMESTAMP`),
		completedAt: timestamp('completed_at', {
			withTimezone: true,
			mode: 'string',
		}),
		projectId: uuid('project_id').notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'milestones_project_id_fkey',
		}),
		pgPolicy('Project owners can create milestones', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
			withCheck: sql`(project_id IN ( SELECT projects.id
   FROM projects
  WHERE (projects.kindler_id = auth.uid())))`,
		}),
		pgPolicy('Public read access to milestones', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
		pgPolicy('Project owners can update milestones', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Project owners can delete milestones', {
			as: 'permissive',
			for: 'delete',
			to: ['public'],
		}),
		check('valid_milestone_amount', sql`amount > (0)::numeric`),
	],
)

export const projectTags = pgTable(
	'project_tags',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		name: text().notNull(),
		color: char({ length: 7 }).notNull(),
		createdAt: timestamp('created_at', { mode: 'string' }).defaultNow(),
		updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow(),
	},
	(table) => [
		unique('project_tags_name_color_key').on(table.name, table.color),
		check(
			'project_tags_color_check',
			sql`(color)::text ~ '^#[0-9A-Fa-f]{6}$'::text`,
		),
	],
)

export const comments = pgTable(
	'comments',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		content: text().notNull(),
		authorId: uuid('author_id').notNull(),
		parentCommentId: uuid('parent_comment_id'),
		projectId: uuid('project_id'),
		projectUpdateId: uuid('project_update_id'),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		}).defaultNow(),
		type: commentType().default('comment').notNull(),
		metadata: jsonb().default({}).notNull(),
	},
	(table) => [
		index('idx_comments_metadata_status')
			.using('btree', sql`((metadata ->> 'status'::text))`)
			.where(sql`(type = 'question'::comment_type)`),
		index('idx_comments_official_answers')
			.using('btree', sql`((metadata ->> 'is_official'::text))`)
			.where(sql`(type = 'answer'::comment_type)`),
		index('idx_comments_parent_id').using(
			'btree',
			table.parentCommentId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_comments_type').using(
			'btree',
			table.type.asc().nullsLast().op('enum_ops'),
		),
		index('idx_comments_type_parent').using(
			'btree',
			table.type.asc().nullsLast().op('uuid_ops'),
			table.parentCommentId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.authorId],
			foreignColumns: [usersInAuth.id],
			name: 'comments_author_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.parentCommentId],
			foreignColumns: [table.id],
			name: 'comments_parent_comment_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'comments_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.projectUpdateId],
			foreignColumns: [projectUpdates.id],
			name: 'comments_project_update_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Public read access to comments', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('update_answer_official', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('update_question_status', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		check(
			'check_project_or_update',
			sql`((project_id IS NOT NULL) AND (project_update_id IS NULL)) OR ((project_id IS NULL) AND (project_update_id IS NOT NULL))`,
		),
		check(
			'chk_comments_metadata_status',
			sql`(type <> 'question'::comment_type) OR ((metadata ->> 'status'::text) = ANY (ARRAY['new'::text, 'answered'::text, 'resolved'::text]))`,
		),
	],
)

export const kycReviews = pgTable(
	'kyc_reviews',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id').notNull(),
		status: kycStatusEnum().notNull(),
		verificationLevel: kycVerificationEnum('verification_level').notNull(),
		reviewerId: uuid('reviewer_id').default(sql`auth.uid()`),
		notes: text(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_kyc_reviews_reviewer_id').using(
			'btree',
			table.reviewerId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_kyc_reviews_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'kyc_reviews_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.reviewerId],
			foreignColumns: [usersInAuth.id],
			name: 'kyc_reviews_reviewer_id_fkey',
		}).onDelete('set null'),
		pgPolicy('Whitelisted users can create KYC reviews', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
			withCheck: sql`((EXISTS ( SELECT 1
   FROM kyc_admin_whitelist
  WHERE (kyc_admin_whitelist.user_id = auth.uid()))) AND (reviewer_id = auth.uid()))`,
		}),
		pgPolicy('Whitelisted users can view all KYC reviews', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
		pgPolicy('Whitelisted users can update KYC reviews', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Users can view their own KYC reviews', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
	],
)

export const kycAdminWhitelist = pgTable(
	'kyc_admin_whitelist',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		createdBy: uuid('created_by'),
		notes: text(),
	},
	(table) => [
		index('idx_kyc_admin_whitelist_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'kyc_admin_whitelist_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.createdBy],
			foreignColumns: [usersInAuth.id],
			name: 'kyc_admin_whitelist_created_by_fkey',
		}).onDelete('set null'),
		unique('kyc_admin_whitelist_user_id_key').on(table.userId),
		pgPolicy('Allow reading admin whitelist', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Whitelisted admins can manage whitelist', {
			as: 'permissive',
			for: 'all',
			to: ['public'],
		}),
	],
)

export const categories = pgTable(
	'categories',
	{
		name: text().notNull(),
		color: char({ length: 7 }).notNull(),
		id: uuid().defaultRandom().primaryKey().notNull(),
		slug: text(),
	},
	(table) => [
		index('categories_slug_idx').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		unique('categories_name_key').on(table.name),
		unique('categories_color_key').on(table.color),
		pgPolicy('Public can read categories', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Admins can write categories', {
			as: 'permissive',
			for: 'all',
			to: ['public'],
		}),
		check('chk_color_format', sql`color ~ '^#[0-9A-Fa-f]{6}$'::text`),
	],
)

export const devices = pgTable(
	'devices',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id'),
		identifier: text().notNull(),
		rpId: text('rp_id').notNull(),
		deviceName: text('device_name'),
		credentialType: credentialType('credential_type')
			.default('public-key')
			.notNull(),
		credentialId: text('credential_id').notNull(),
		aaguid: text().default('00000000-0000-0000-0000-000000000000').notNull(),
		address: text().default('0x').notNull(),
		signCount: integer('sign_count').default(0).notNull(),
		transports: text().array().default(['']).notNull(),
		profileVerificationStatus: profileVerificationStatus(
			'profile_verification_status',
		)
			.default('unverified')
			.notNull(),
		deviceType: deviceType('device_type').default('single_device').notNull(),
		backupState: backupState('backup_state').default('not_backed_up').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		lastUsedAt: timestamp('last_used_at', {
			withTimezone: true,
			mode: 'string',
		}),
		publicKey: text('public_key').notNull(),
		nextAuthUserId: uuid('next_auth_user_id'),
	},
	(table) => [
		index('idx_devices_credential_id').using(
			'btree',
			table.credentialId.asc().nullsLast().op('text_ops'),
		),
		index('idx_devices_identifier_rp_id').using(
			'btree',
			table.identifier.asc().nullsLast().op('text_ops'),
			table.rpId.asc().nullsLast().op('text_ops'),
		),
		index('idx_devices_next_auth_user_id').using(
			'btree',
			table.nextAuthUserId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_devices_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.nextAuthUserId],
			foreignColumns: [usersInNextAuth.id],
			name: 'devices_next_auth_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'devices_user_id_fkey',
		}),
		unique('devices_credential_id_key').on(table.credentialId),
		pgPolicy('Service role can manage all devices', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
			using: sql`true`,
		}),
		pgPolicy('Users can view their own devices via NextAuth', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
		}),
		pgPolicy('Users can insert their own devices via NextAuth', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
		}),
		pgPolicy('Users can update their own devices via NextAuth', {
			as: 'permissive',
			for: 'update',
			to: ['public'],
		}),
		pgPolicy('Users can delete their own devices via NextAuth', {
			as: 'permissive',
			for: 'delete',
			to: ['public'],
		}),
	],
)

export const waitlistInterests = pgTable(
	'waitlist_interests',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		name: text().notNull(),
		email: text(),
		role: text().notNull(),
		projectName: text('project_name'),
		projectDescription: text('project_description'),
		categoryId: uuid('category_id'),
		location: text(),
		source: text(),
		consent: boolean().default(false).notNull(),
	},
	(table) => [
		index('waitlist_interests_category_id_idx').using(
			'btree',
			table.categoryId.asc().nullsLast().op('uuid_ops'),
		),
		index('waitlist_interests_created_at_idx').using(
			'btree',
			table.createdAt.desc().nullsFirst().op('timestamptz_ops'),
		),
		index('waitlist_interests_email_idx').using('btree', sql`lower(email)`),
		index('waitlist_interests_role_idx').using(
			'btree',
			table.role.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: 'waitlist_interests_category_id_fkey',
		}).onDelete('set null'),
		pgPolicy('Allow public inserts', {
			as: 'permissive',
			for: 'insert',
			to: ['public'],
			withCheck: sql`true`,
		}),
		pgPolicy('No public select', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
		}),
		pgPolicy('No public update', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('No public delete', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
		check(
			'waitlist_interests_role_check',
			sql`role = ANY (ARRAY['project_creator'::text, 'supporter'::text, 'partner'::text])`,
		),
	],
)

export const challenges = pgTable(
	'challenges',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid('user_id').default(sql`auth.uid()`),
		identifier: text().notNull(),
		rpId: text('rp_id').notNull(),
		challenge: text().notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' })
			.default(sql`(now() + '00:05:00'::interval)`)
			.notNull(),
		nextAuthUserId: uuid('next_auth_user_id'),
	},
	(table) => [
		index('idx_challenges_expires_at').using(
			'btree',
			table.expiresAt.asc().nullsLast().op('timestamptz_ops'),
		),
		index('idx_challenges_identifier_rp_id').using(
			'btree',
			table.identifier.asc().nullsLast().op('text_ops'),
			table.rpId.asc().nullsLast().op('text_ops'),
		),
		index('idx_challenges_next_auth_user_id').using(
			'btree',
			table.nextAuthUserId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: 'challenges_user_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.nextAuthUserId],
			foreignColumns: [usersInNextAuth.id],
			name: 'challenges_next_auth_user_id_fkey',
		}).onDelete('cascade'),
		unique('challenges_identifier_rp_id_key').on(table.identifier, table.rpId),
		pgPolicy('Service role can manage all challenges', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
			using: sql`true`,
		}),
		pgPolicy('Users can manage their own challenges via NextAuth', {
			as: 'permissive',
			for: 'all',
			to: ['public'],
		}),
	],
)

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

export const usersInNextAuth = nextAuth.table(
	'users',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		name: text(),
		email: text(),
		image: text(),
		emailVerified: timestamp('email_verified', {
			withTimezone: true,
			mode: 'string',
		}),
	},
	(table) => [
		unique('email_unique').on(table.email),
		pgPolicy('Users can view own user data', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`(next_auth.uid() = id)`,
		}),
		pgPolicy('Service role can manage all users', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
		}),
	],
)

export const sessionsInNextAuth = nextAuth.table(
	'sessions',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
		sessionToken: text('session_token').notNull(),
		userId: uuid('user_id'),
	},
	(table) => [
		index('idx_next_auth_sessions_session_token').using(
			'btree',
			table.sessionToken.asc().nullsLast().op('text_ops'),
		),
		index('idx_next_auth_sessions_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInNextAuth.id],
			name: 'sessions_user_id_fkey',
		}).onDelete('cascade'),
		unique('sessiontoken_unique').on(table.sessionToken),
		unique('sessions_session_token_key').on(table.sessionToken),
		pgPolicy('Users can view own sessions', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`(next_auth.uid() = user_id)`,
		}),
		pgPolicy('Service role can manage all sessions', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
		}),
	],
)

export const accountsInNextAuth = nextAuth.table(
	'accounts',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		type: text().notNull(),
		provider: text().notNull(),
		providerAccountId: text('provider_account_id').notNull(),
		refreshToken: text('refresh_token'),
		accessToken: text('access_token'),
		// You can use { mode: "bigint" } if numbers are exceeding js number limitations
		expiresAt: bigint('expires_at', { mode: 'number' }),
		tokenType: text('token_type'),
		scope: text(),
		idToken: text('id_token'),
		sessionState: text('session_state'),
		oauthTokenSecret: text('oauth_token_secret'),
		oauthToken: text('oauth_token'),
		userId: uuid('user_id'),
	},
	(table) => [
		index('idx_next_auth_accounts_provider').using(
			'btree',
			table.provider.asc().nullsLast().op('text_ops'),
			table.providerAccountId.asc().nullsLast().op('text_ops'),
		),
		index('idx_next_auth_accounts_user_id').using(
			'btree',
			table.userId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInNextAuth.id],
			name: 'accounts_user_id_fkey',
		}).onDelete('cascade'),
		unique('provider_unique').on(table.provider, table.providerAccountId),
		unique('accounts_provider_provider_account_id_key').on(
			table.provider,
			table.providerAccountId,
		),
		pgPolicy('Users can view own accounts', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`(next_auth.uid() = user_id)`,
		}),
		pgPolicy('Service role can manage all accounts', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
		}),
	],
)

export const verificationTokensInNextAuth = nextAuth.table(
	'verification_tokens',
	{
		identifier: text(),
		token: text().primaryKey().notNull(),
		expires: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	},
	(table) => [
		unique('verification_tokens_identifier_token_key').on(
			table.identifier,
			table.token,
		),
		pgPolicy('Service role can manage all verification tokens', {
			as: 'permissive',
			for: 'all',
			to: ['service_role'],
			using: sql`true`,
		}),
	],
)

export const projectTagRelationships = pgTable(
	'project_tag_relationships',
	{
		projectId: uuid('project_id').notNull(),
		tagId: uuid('tag_id').notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_tag_relationships_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.tagId],
			foreignColumns: [projectTags.id],
			name: 'project_tag_relationships_tag_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.projectId, table.tagId],
			name: 'project_tag_relationships_pkey',
		}),
	],
)

export const kindlerProjects = pgTable(
	'kindler_projects',
	{
		kindlerId: uuid('kindler_id').notNull(),
		projectId: uuid('project_id').notNull(),
		joinedAt: timestamp('joined_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_kindler_projects_project_id').using(
			'btree',
			table.projectId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.kindlerId],
			foreignColumns: [usersInAuth.id],
			name: 'kindler_projects_kindler_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'kindler_projects_project_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.kindlerId, table.projectId],
			name: 'kindler_projects_pkey',
		}),
		pgPolicy('Kindler-project relationships viewable by everyone', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`true`,
		}),
		pgPolicy('Users can join projects as kindlers', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Users can leave projects', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const userFollows = pgTable(
	'user_follows',
	{
		followerId: uuid('follower_id').notNull(),
		followingId: uuid('following_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_user_follows_follower').using(
			'btree',
			table.followerId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_user_follows_following').using(
			'btree',
			table.followingId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.followerId],
			foreignColumns: [profiles.id],
			name: 'user_follows_follower_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.followingId],
			foreignColumns: [profiles.id],
			name: 'user_follows_following_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.followerId, table.followingId],
			name: 'user_follows_pkey',
		}),
		pgPolicy('user_follows_select', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('user_follows_insert', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('user_follows_delete', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const escrowMilestones = pgTable(
	'escrow_milestones',
	{
		escrowId: uuid('escrow_id').notNull(),
		milestoneId: uuid('milestone_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index('idx_escrow_milestones_escrow_id').using(
			'btree',
			table.escrowId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_escrow_milestones_milestone_id').using(
			'btree',
			table.milestoneId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.escrowId],
			foreignColumns: [escrowContracts.id],
			name: 'escrow_milestones_escrow_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.milestoneId],
			foreignColumns: [milestones.id],
			name: 'escrow_milestones_milestone_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.escrowId, table.milestoneId],
			name: 'escrow_milestones_pkey1',
		}),
		pgPolicy('select escrow_milestones for owners', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`(EXISTS ( SELECT 1
   FROM (milestones m
     JOIN projects p ON ((p.id = m.project_id)))
  WHERE ((m.id = escrow_milestones.milestone_id) AND (p.kindler_id = next_auth.uid()))))`,
		}),
		pgPolicy('insert escrow_milestones for owners', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('update escrow_milestones for owners', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('delete escrow_milestones for owners', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const projectEscrows = pgTable(
	'project_escrows',
	{
		projectId: uuid('project_id').notNull(),
		escrowId: uuid('escrow_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: 'project_escrows_project_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.escrowId],
			foreignColumns: [escrowContracts.id],
			name: 'project_escrows_escrow_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.projectId, table.escrowId],
			name: 'project_escrows_pkey',
		}),
		unique('unique_project_id').on(table.projectId),
		unique('unique_escrow_id').on(table.escrowId),
		pgPolicy('select project_escrows for project owners', {
			as: 'permissive',
			for: 'select',
			to: ['authenticated'],
			using: sql`(EXISTS ( SELECT 1
   FROM projects p
  WHERE ((p.id = project_escrows.project_id) AND (p.kindler_id = next_auth.uid()))))`,
		}),
		pgPolicy('insert project_escrows for project owners', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('update project_escrows for project owners', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('delete project_escrows for project owners', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const foundations = pgTable(
	'foundations',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		name: text().notNull(),
		description: text().notNull(),
		slug: text().notNull(),
		logoUrl: text('logo_url'),
		coverImageUrl: text('cover_image_url'),
		founderId: uuid('founder_id').notNull(),
		foundedYear: integer('founded_year').notNull(),
		mission: text(),
		vision: text(),
		websiteUrl: text('website_url'),
		socialLinks: jsonb('social_links').default({}).notNull(),
		totalDonationsReceived: numeric('total_donations_received', {
			precision: 20,
			scale: 7,
		})
			.default('0')
			.notNull(),
		totalCampaignsCompleted: integer('total_campaigns_completed')
			.default(0)
			.notNull(),
		totalCampaignsOpen: integer('total_campaigns_open').default(0).notNull(),
		metadata: jsonb().default({}).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		uniqueIndex('foundations_slug_key').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		index('idx_foundations_founder_id').using(
			'btree',
			table.founderId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_foundations_slug').using(
			'btree',
			table.slug.asc().nullsLast().op('text_ops'),
		),
		foreignKey({
			columns: [table.founderId],
			foreignColumns: [usersInNextAuth.id],
			name: 'foundations_founder_id_fkey',
		}).onDelete('cascade'),
		check(
			'valid_slug_format',
			sql`slug ~ '^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$'::text`,
		),
		check(
			'valid_founded_year',
			sql`founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)`,
		),
		pgPolicy('Public read access to foundations', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Authenticated users can insert foundations', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Founders can update their foundations', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('Founders can delete their foundations', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const foundationMilestones = pgTable(
	'foundation_milestones',
	{
		id: uuid().default(sql`uuid_generate_v4()`).primaryKey().notNull(),
		foundationId: uuid('foundation_id').notNull(),
		title: text().notNull(),
		description: text(),
		achievedDate: timestamp('achieved_date', {
			withTimezone: false,
			mode: 'date',
		}).notNull(),
		impactMetric: text('impact_metric'),
		metadata: jsonb().default({}),
		createdAt: timestamp('created_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		updatedAt: timestamp('updated_at', {
			withTimezone: true,
			mode: 'string',
		})
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index('idx_foundation_milestones_foundation_id').using(
			'btree',
			table.foundationId.asc().nullsLast().op('uuid_ops'),
		),
		foreignKey({
			columns: [table.foundationId],
			foreignColumns: [foundations.id],
			name: 'foundation_milestones_foundation_id_fkey',
		}).onDelete('cascade'),
		pgPolicy('Public read access to foundation milestones', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Foundation founders can insert milestones', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
		pgPolicy('Foundation founders can update milestones', {
			as: 'permissive',
			for: 'update',
			to: ['authenticated'],
		}),
		pgPolicy('Foundation founders can delete milestones', {
			as: 'permissive',
			for: 'delete',
			to: ['authenticated'],
		}),
	],
)

export const foundationEscrows = pgTable(
	'foundation_escrows',
	{
		foundationId: uuid('foundation_id').notNull(),
		escrowId: uuid('escrow_id').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.foundationId],
			foreignColumns: [foundations.id],
			name: 'foundation_escrows_foundation_id_fkey',
		}).onDelete('cascade'),
		foreignKey({
			columns: [table.escrowId],
			foreignColumns: [escrowContracts.id],
			name: 'foundation_escrows_escrow_id_fkey',
		}).onDelete('cascade'),
		primaryKey({
			columns: [table.foundationId, table.escrowId],
			name: 'foundation_escrows_pkey',
		}),
		index('idx_foundation_escrows_foundation_id').using(
			'btree',
			table.foundationId.asc().nullsLast().op('uuid_ops'),
		),
		index('idx_foundation_escrows_escrow_id').using(
			'btree',
			table.escrowId.asc().nullsLast().op('uuid_ops'),
		),
		pgPolicy('Public read access to foundation escrows', {
			as: 'permissive',
			for: 'select',
			to: ['public'],
			using: sql`true`,
		}),
		pgPolicy('Foundation founders can insert escrows', {
			as: 'permissive',
			for: 'insert',
			to: ['authenticated'],
		}),
	],
)
