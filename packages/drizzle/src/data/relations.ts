import { relations } from 'drizzle-orm/relations'
import {
	categories,
	challenges,
	comments,
	community,
	contributions,
	devices,
	escrowContracts,
	escrowMilestones,
	escrowReviews,
	flowStateInAuth,
	identitiesInAuth,
	kindlerProjects,
	kycAdminWhitelist,
	kycReviews,
	mfaAmrClaimsInAuth,
	mfaChallengesInAuth,
	mfaFactorsInAuth,
	milestones,
	notificationPreferences,
	notifications,
	oneTimeTokensInAuth,
	profiles,
	projectEscrows,
	projectMembers,
	projectPitch,
	projects,
	projectTagRelationships,
	projectTags,
	projectUpdates,
	refreshTokensInAuth,
	samlProvidersInAuth,
	samlRelayStatesInAuth,
	sessionsInAuth,
	ssoDomainsInAuth,
	ssoProvidersInAuth,
	usersInAuth,
	usersInNextAuth,
	waitlistInterests,
} from './schema'

export const refreshTokensInAuthRelations = relations(
	refreshTokensInAuth,
	({ one }) => ({
		sessionsInAuth: one(sessionsInAuth, {
			fields: [refreshTokensInAuth.sessionId],
			references: [sessionsInAuth.id],
		}),
	}),
)

export const sessionsInAuthRelations = relations(
	sessionsInAuth,
	({ one, many }) => ({
		refreshTokensInAuths: many(refreshTokensInAuth),
		usersInAuth: one(usersInAuth, {
			fields: [sessionsInAuth.userId],
			references: [usersInAuth.id],
		}),
		mfaAmrClaimsInAuths: many(mfaAmrClaimsInAuth),
	}),
)

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
	sessionsInAuths: many(sessionsInAuth),
	identitiesInAuths: many(identitiesInAuth),
	mfaFactorsInAuths: many(mfaFactorsInAuth),
	oneTimeTokensInAuths: many(oneTimeTokensInAuth),
	profiles: many(profiles),
	projectUpdates: many(projectUpdates),
	projects: many(projects),
	projectMembers: many(projectMembers),
	comments: many(comments),
	kycReviews_userId: many(kycReviews, {
		relationName: 'kycReviews_userId_usersInAuth_id',
	}),
	kycReviews_reviewerId: many(kycReviews, {
		relationName: 'kycReviews_reviewerId_usersInAuth_id',
	}),
	kycAdminWhitelists_userId: many(kycAdminWhitelist, {
		relationName: 'kycAdminWhitelist_userId_usersInAuth_id',
	}),
	kycAdminWhitelists_createdBy: many(kycAdminWhitelist, {
		relationName: 'kycAdminWhitelist_createdBy_usersInAuth_id',
	}),
	devices: many(devices),
	challenges: many(challenges),
	notificationPreferences: many(notificationPreferences),
	notifications: many(notifications),
	kindlerProjects: many(kindlerProjects),
}))

export const identitiesInAuthRelations = relations(
	identitiesInAuth,
	({ one }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [identitiesInAuth.userId],
			references: [usersInAuth.id],
		}),
	}),
)

export const mfaFactorsInAuthRelations = relations(
	mfaFactorsInAuth,
	({ one, many }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [mfaFactorsInAuth.userId],
			references: [usersInAuth.id],
		}),
		mfaChallengesInAuths: many(mfaChallengesInAuth),
	}),
)

export const mfaChallengesInAuthRelations = relations(
	mfaChallengesInAuth,
	({ one }) => ({
		mfaFactorsInAuth: one(mfaFactorsInAuth, {
			fields: [mfaChallengesInAuth.factorId],
			references: [mfaFactorsInAuth.id],
		}),
	}),
)

export const ssoDomainsInAuthRelations = relations(
	ssoDomainsInAuth,
	({ one }) => ({
		ssoProvidersInAuth: one(ssoProvidersInAuth, {
			fields: [ssoDomainsInAuth.ssoProviderId],
			references: [ssoProvidersInAuth.id],
		}),
	}),
)

export const ssoProvidersInAuthRelations = relations(
	ssoProvidersInAuth,
	({ many }) => ({
		ssoDomainsInAuths: many(ssoDomainsInAuth),
		samlRelayStatesInAuths: many(samlRelayStatesInAuth),
		samlProvidersInAuths: many(samlProvidersInAuth),
	}),
)

export const samlRelayStatesInAuthRelations = relations(
	samlRelayStatesInAuth,
	({ one }) => ({
		ssoProvidersInAuth: one(ssoProvidersInAuth, {
			fields: [samlRelayStatesInAuth.ssoProviderId],
			references: [ssoProvidersInAuth.id],
		}),
		flowStateInAuth: one(flowStateInAuth, {
			fields: [samlRelayStatesInAuth.flowStateId],
			references: [flowStateInAuth.id],
		}),
	}),
)

export const flowStateInAuthRelations = relations(
	flowStateInAuth,
	({ many }) => ({
		samlRelayStatesInAuths: many(samlRelayStatesInAuth),
	}),
)

export const mfaAmrClaimsInAuthRelations = relations(
	mfaAmrClaimsInAuth,
	({ one }) => ({
		sessionsInAuth: one(sessionsInAuth, {
			fields: [mfaAmrClaimsInAuth.sessionId],
			references: [sessionsInAuth.id],
		}),
	}),
)

export const samlProvidersInAuthRelations = relations(
	samlProvidersInAuth,
	({ one }) => ({
		ssoProvidersInAuth: one(ssoProvidersInAuth, {
			fields: [samlProvidersInAuth.ssoProviderId],
			references: [ssoProvidersInAuth.id],
		}),
	}),
)

export const oneTimeTokensInAuthRelations = relations(
	oneTimeTokensInAuth,
	({ one }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [oneTimeTokensInAuth.userId],
			references: [usersInAuth.id],
		}),
	}),
)

export const escrowReviewsRelations = relations(escrowReviews, ({ one }) => ({
	escrowContract: one(escrowContracts, {
		fields: [escrowReviews.escrowId],
		references: [escrowContracts.id],
	}),
	milestone: one(milestones, {
		fields: [escrowReviews.milestoneId],
		references: [milestones.id],
	}),
}))

export const escrowContractsRelations = relations(
	escrowContracts,
	({ one, many }) => ({
		escrowReviews: many(escrowReviews),
		project: one(projects, {
			fields: [escrowContracts.projectId],
			references: [projects.id],
		}),
		contribution: one(contributions, {
			fields: [escrowContracts.contributionId],
			references: [contributions.id],
		}),
		escrowMilestones: many(escrowMilestones),
		projectEscrows: many(projectEscrows),
	}),
)

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
	escrowReviews: many(escrowReviews),
	project: one(projects, {
		fields: [milestones.projectId],
		references: [projects.id],
	}),
	escrowMilestones: many(escrowMilestones),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id],
	}),
	usersInNextAuth_nextAuthUserId: one(usersInNextAuth, {
		fields: [profiles.nextAuthUserId],
		references: [usersInNextAuth.id],
		relationName: 'profiles_nextAuthUserId_usersInNextAuth_id',
	}),
	usersInNextAuth_id: one(usersInNextAuth, {
		fields: [profiles.id],
		references: [usersInNextAuth.id],
		relationName: 'profiles_id_usersInNextAuth_id',
	}),
}))

export const usersInNextAuthRelations = relations(
	usersInNextAuth,
	({ many }) => ({
		profiles_nextAuthUserId: many(profiles, {
			relationName: 'profiles_nextAuthUserId_usersInNextAuth_id',
		}),
		profiles_id: many(profiles, {
			relationName: 'profiles_id_usersInNextAuth_id',
		}),
		devices: many(devices),
		challenges: many(challenges),
	}),
)

export const contributionsRelations = relations(
	contributions,
	({ one, many }) => ({
		project: one(projects, {
			fields: [contributions.projectId],
			references: [projects.id],
		}),
		escrowContracts: many(escrowContracts),
	}),
)

export const projectsRelations = relations(projects, ({ one, many }) => ({
	contributions: many(contributions),
	escrowContracts: many(escrowContracts),
	projectUpdates: many(projectUpdates),
	projectPitches: many(projectPitch),
	usersInAuth: one(usersInAuth, {
		fields: [projects.kindlerId],
		references: [usersInAuth.id],
	}),
	category: one(categories, {
		fields: [projects.categoryId],
		references: [categories.id],
	}),
	communities: many(community),
	projectMembers: many(projectMembers),
	milestones: many(milestones),
	comments: many(comments),
	projectTagRelationships: many(projectTagRelationships),
	kindlerProjects: many(kindlerProjects),
	projectEscrows: many(projectEscrows),
}))

export const projectUpdatesRelations = relations(
	projectUpdates,
	({ one, many }) => ({
		project: one(projects, {
			fields: [projectUpdates.projectId],
			references: [projects.id],
		}),
		usersInAuth: one(usersInAuth, {
			fields: [projectUpdates.authorId],
			references: [usersInAuth.id],
		}),
		communities: many(community),
		comments: many(comments),
	}),
)

export const projectPitchRelations = relations(projectPitch, ({ one }) => ({
	project: one(projects, {
		fields: [projectPitch.projectId],
		references: [projects.id],
	}),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
	projects: many(projects),
	waitlistInterests: many(waitlistInterests),
}))

export const communityRelations = relations(community, ({ one }) => ({
	project: one(projects, {
		fields: [community.projectId],
		references: [projects.id],
	}),
	projectUpdate: one(projectUpdates, {
		fields: [community.updateId],
		references: [projectUpdates.id],
	}),
	comment: one(comments, {
		fields: [community.commentId],
		references: [comments.id],
	}),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
	communities: many(community),
	usersInAuth: one(usersInAuth, {
		fields: [comments.authorId],
		references: [usersInAuth.id],
	}),
	comment: one(comments, {
		fields: [comments.parentCommentId],
		references: [comments.id],
		relationName: 'comments_parentCommentId_comments_id',
	}),
	comments: many(comments, {
		relationName: 'comments_parentCommentId_comments_id',
	}),
	project: one(projects, {
		fields: [comments.projectId],
		references: [projects.id],
	}),
	projectUpdate: one(projectUpdates, {
		fields: [comments.projectUpdateId],
		references: [projectUpdates.id],
	}),
}))

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
	project: one(projects, {
		fields: [projectMembers.projectId],
		references: [projects.id],
	}),
	usersInAuth: one(usersInAuth, {
		fields: [projectMembers.userId],
		references: [usersInAuth.id],
	}),
}))

export const kycReviewsRelations = relations(kycReviews, ({ one }) => ({
	usersInAuth_userId: one(usersInAuth, {
		fields: [kycReviews.userId],
		references: [usersInAuth.id],
		relationName: 'kycReviews_userId_usersInAuth_id',
	}),
	usersInAuth_reviewerId: one(usersInAuth, {
		fields: [kycReviews.reviewerId],
		references: [usersInAuth.id],
		relationName: 'kycReviews_reviewerId_usersInAuth_id',
	}),
}))

export const kycAdminWhitelistRelations = relations(
	kycAdminWhitelist,
	({ one }) => ({
		usersInAuth_userId: one(usersInAuth, {
			fields: [kycAdminWhitelist.userId],
			references: [usersInAuth.id],
			relationName: 'kycAdminWhitelist_userId_usersInAuth_id',
		}),
		usersInAuth_createdBy: one(usersInAuth, {
			fields: [kycAdminWhitelist.createdBy],
			references: [usersInAuth.id],
			relationName: 'kycAdminWhitelist_createdBy_usersInAuth_id',
		}),
	}),
)

export const devicesRelations = relations(devices, ({ one }) => ({
	usersInNextAuth: one(usersInNextAuth, {
		fields: [devices.nextAuthUserId],
		references: [usersInNextAuth.id],
	}),
	usersInAuth: one(usersInAuth, {
		fields: [devices.userId],
		references: [usersInAuth.id],
	}),
}))

export const waitlistInterestsRelations = relations(
	waitlistInterests,
	({ one }) => ({
		category: one(categories, {
			fields: [waitlistInterests.categoryId],
			references: [categories.id],
		}),
	}),
)

export const challengesRelations = relations(challenges, ({ one }) => ({
	usersInAuth: one(usersInAuth, {
		fields: [challenges.userId],
		references: [usersInAuth.id],
	}),
	usersInNextAuth: one(usersInNextAuth, {
		fields: [challenges.nextAuthUserId],
		references: [usersInNextAuth.id],
	}),
}))

export const notificationPreferencesRelations = relations(
	notificationPreferences,
	({ one }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [notificationPreferences.userId],
			references: [usersInAuth.id],
		}),
	}),
)

export const notificationsRelations = relations(notifications, ({ one }) => ({
	usersInAuth: one(usersInAuth, {
		fields: [notifications.userId],
		references: [usersInAuth.id],
	}),
}))

export const projectTagRelationshipsRelations = relations(
	projectTagRelationships,
	({ one }) => ({
		project: one(projects, {
			fields: [projectTagRelationships.projectId],
			references: [projects.id],
		}),
		projectTag: one(projectTags, {
			fields: [projectTagRelationships.tagId],
			references: [projectTags.id],
		}),
	}),
)

export const projectTagsRelations = relations(projectTags, ({ many }) => ({
	projectTagRelationships: many(projectTagRelationships),
}))

export const kindlerProjectsRelations = relations(
	kindlerProjects,
	({ one }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [kindlerProjects.kindlerId],
			references: [usersInAuth.id],
		}),
		project: one(projects, {
			fields: [kindlerProjects.projectId],
			references: [projects.id],
		}),
	}),
)

export const escrowMilestonesRelations = relations(
	escrowMilestones,
	({ one }) => ({
		escrowContract: one(escrowContracts, {
			fields: [escrowMilestones.escrowId],
			references: [escrowContracts.id],
		}),
		milestone: one(milestones, {
			fields: [escrowMilestones.milestoneId],
			references: [milestones.id],
		}),
	}),
)

export const projectEscrowsRelations = relations(projectEscrows, ({ one }) => ({
	project: one(projects, {
		fields: [projectEscrows.projectId],
		references: [projects.id],
	}),
	escrowContract: one(escrowContracts, {
		fields: [projectEscrows.escrowId],
		references: [escrowContracts.id],
	}),
}))
