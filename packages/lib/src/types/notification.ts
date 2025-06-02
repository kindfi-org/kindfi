export enum NotificationType {
	ProjectUpdate = 'project_update',
	MilestoneCompleted = 'milestone_completed',
	EscrowReleased = 'escrow_released',
	KycStatusChange = 'kyc_status_change',
	CommentAdded = 'comment_added',
	MemberJoined = 'member_joined',
	SystemAlert = 'system_alert',
}

export enum NotificationStatus {
	Pending = 'pending',
	Delivered = 'delivered',
	Failed = 'failed',
}

export interface NotificationMetadata {
	url?: string
	projectId?: string
	milestoneId?: string
	escrowId?: string
	commentId?: string
	userId?: string
	[key: string]: unknown
}
