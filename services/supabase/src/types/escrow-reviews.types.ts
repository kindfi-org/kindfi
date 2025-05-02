// Define the types for the escrow_reviews table based on our migration
export interface EscrowReview {
    id: string;
    escrow_id: string;
    milestone_id?: string;
    reviewer_address: string;
    status: string;
    review_notes?: string;
    created_at: string;
    reviewed_at?: string;
    disputer_id?: string;
    type: string;
    resolution_text?: string;
    evidence_urls?: string[];
    transaction_hash?: string;
}

export interface EscrowReviewInsert {
    id?: string;
    escrow_id: string;
    milestone_id?: string;
    reviewer_address: string;
    status?: string;
    review_notes?: string;
    created_at?: string;
    reviewed_at?: string;
    disputer_id?: string;
    type: string;
    resolution_text?: string;
    evidence_urls?: string[];
    transaction_hash?: string;
}

export interface EscrowReviewUpdate {
    id?: string;
    escrow_id?: string;
    milestone_id?: string;
    reviewer_address?: string;
    status?: string;
    review_notes?: string;
    created_at?: string;
    reviewed_at?: string;
    disputer_id?: string;
    type?: string;
    resolution_text?: string;
    evidence_urls?: string[];
    transaction_hash?: string;
}

// Define the types for the escrow_mediators table
export interface EscrowMediator {
    id: string;
    user_id: string;
    mediator_address: string;
    name: string;
    created_at: string;
    active: boolean;
}

export interface EscrowMediatorInsert {
    id?: string;
    user_id: string;
    mediator_address: string;
    name: string;
    created_at?: string;
    active?: boolean;
}

export interface EscrowMediatorUpdate {
    id?: string;
    user_id?: string;
    mediator_address?: string;
    name?: string;
    created_at?: string;
    active?: boolean;
}

// Define the types for the escrow_dispute_assignments table
export interface EscrowDisputeAssignment {
    id: string;
    review_id: string;
    mediator_id: string;
    assigned_by: string;
    assigned_at: string;
}

export interface EscrowDisputeAssignmentInsert {
    id?: string;
    review_id: string;
    mediator_id: string;
    assigned_by: string;
    assigned_at?: string;
}

export interface EscrowDisputeAssignmentUpdate {
    id?: string;
    review_id?: string;
    mediator_id?: string;
    assigned_by?: string;
    assigned_at?: string;
}

// Export review type enum
export type ReviewType = 'dispute' | 'milestone';

// Export review status enum
export type ReviewStatus = 'PENDING' | 'MEDIATION' | 'APPROVED' | 'REJECTED' | 'RESOLVED';

// Define payload types for the API
export interface DisputePayload {
    escrowId: string;
    milestoneId: string;
    filerAddress: string;
    disputeReason: string;
    evidenceUrls?: string[];
    signer: string;
    escrowContractAddress: string;
}

export interface DisputeResolutionPayload {
    disputeId: string;
    mediatorId: string;
    resolution: ReviewStatus;
    resolutionNotes: string;
    approverAmount: string;
    serviceProviderAmount: string;
    signer: string;
    escrowContractAddress: string;
}

export interface MediatorAssignmentPayload {
    disputeId: string;
    mediatorId: string;
    assignedById: string;
}

export interface EvidenceSubmissionPayload {
    disputeId: string;
    submitterAddress: string;
    evidenceType: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'TEXT';
    evidenceUrl: string;
    description: string;
}

// Payload for signing transactions (both filing and resolving disputes)
export interface DisputeSignPayload {
    unsignedTransaction: string;
    signer: string;
    type: 'file' | 'resolve';
    // For filing a dispute
    escrowId?: string;
    milestoneId?: string;
    filerAddress?: string;
    disputeReason?: string;
    evidenceUrls?: string[];
    escrowParticipantId?: string;
    // For resolving a dispute
    disputeId?: string;
    mediatorId?: string;
    resolution?: ReviewStatus;
    resolutionNotes?: string;
    approverAmount?: string;
    serviceProviderAmount?: string;
    escrowContractAddress?: string;
}
