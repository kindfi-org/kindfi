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
	kycReviews,
	kycStatus,
	mfaAmrClaimsInAuth,
	mfaChallengesInAuth,
	mfaFactorsInAuth,
	milestones,
	notificationPreferences,
	notifications,
	oneTimeTokensInAuth,
	profiles,
	projectMembers,
	projectPitch,
	projectTagRelationships,
	projectTags,
	projectUpdates,
	projects,
	refreshTokensInAuth,
	samlProvidersInAuth,
	samlRelayStatesInAuth,
	sessionsInAuth,
	ssoDomainsInAuth,
	ssoProvidersInAuth,
	usersInAuth,
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
	oneTimeTokensInAuths: many(oneTimeTokensInAuth),
	mfaFactorsInAuths: many(mfaFactorsInAuth),
	projectUpdates: many(projectUpdates),
	projects: many(projects),
	comments: many(comments),
	profiles: many(profiles),
	kycStatuses: many(kycStatus),
	kycReviews: many(kycReviews),
	projectMembers: many(projectMembers),
	notificationPreferences: many(notificationPreferences),
	notifications: many(notifications),
	challenges: many(challenges),
	devices: many(devices),
	kindlerProjects: many(kindlerProjects),
}))

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

export const mfaAmrClaimsInAuthRelations = relations(
	mfaAmrClaimsInAuth,
	({ one }) => ({
		sessionsInAuth: one(sessionsInAuth, {
			fields: [mfaAmrClaimsInAuth.sessionId],
			references: [sessionsInAuth.id],
		}),
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

export const samlProvidersInAuthRelations = relations(
	samlProvidersInAuth,
	({ one }) => ({
		ssoProvidersInAuth: one(ssoProvidersInAuth, {
			fields: [samlProvidersInAuth.ssoProviderId],
			references: [ssoProvidersInAuth.id],
		}),
	}),
)

export const identitiesInAuthRelations = relations(
	identitiesInAuth,
	({ one }) => ({
		usersInAuth: one(usersInAuth, {
			fields: [identitiesInAuth.userId],
			references: [usersInAuth.id],
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
		fields: [projects.ownerId],
		references: [usersInAuth.id],
	}),
	category: one(categories, {
		fields: [projects.categoryId],
		references: [categories.id],
	}),
	milestones: many(milestones),
	communities: many(community),
	comments: many(comments),
	projectMembers: many(projectMembers),
	projectTagRelationships: many(projectTagRelationships),
	kindlerProjects: many(kindlerProjects),
}))

export const escrowContractsRelations = relations(
	escrowContracts,
	({ one, many }) => ({
		project: one(projects, {
			fields: [escrowContracts.projectId],
			references: [projects.id],
		}),
		contribution: one(contributions, {
			fields: [escrowContracts.contributionId],
			references: [contributions.id],
		}),
		escrowReviews: many(escrowReviews),
		escrowMilestones: many(escrowMilestones),
	}),
)

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
}))

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
	project: one(projects, {
		fields: [milestones.projectId],
		references: [projects.id],
	}),
	escrowReviews: many(escrowReviews),
	escrowMilestones: many(escrowMilestones),
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

export const profilesRelations = relations(profiles, ({ one }) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profiles.id],
		references: [usersInAuth.id],
	}),
}))

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

export const kycStatusRelations = relations(kycStatus, ({ one, many }) => ({
	usersInAuth: one(usersInAuth, {
		fields: [kycStatus.userId],
		references: [usersInAuth.id],
	}),
	kycReviews: many(kycReviews),
}))

export const kycReviewsRelations = relations(kycReviews, ({ one }) => ({
	kycStatus: one(kycStatus, {
		fields: [kycReviews.kycStatusId],
		references: [kycStatus.id],
	}),
	usersInAuth: one(usersInAuth, {
		fields: [kycReviews.reviewerId],
		references: [usersInAuth.id],
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

export const challengesRelations = relations(challenges, ({ one }) => ({
	usersInAuth: one(usersInAuth, {
		fields: [challenges.userId],
		references: [usersInAuth.id],
	}),
}))

export const devicesRelations = relations(devices, ({ one }) => ({
	usersInAuth: one(usersInAuth, {
		fields: [devices.userId],
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
