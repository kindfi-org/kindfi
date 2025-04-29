import type { CreatedAt, UpdatedAt } from '../date.types'

/**
 * Dispute status types
 */
export type DisputeStatus = 
    | 'pending'
    | 'in_review'
    | 'resolved'
    | 'rejected'

/**
 * Evidence type for dispute
 */
export interface DisputeEvidence {
    id: string
    escrowDisputeId: string
    evidenceUrl: string
    description: string
    submittedBy: string
    createdAt: CreatedAt
}

/**
 * Dispute type
 */
export interface Dispute {
    id: string
    escrowId: string
    status: DisputeStatus
    reason: string
    initiator: string
    mediator?: string
    resolution?: string
    evidences?: DisputeEvidence[]
    createdAt: CreatedAt
    updatedAt: UpdatedAt
    resolvedAt?: string
}

/**
 * Dispute creation payload
 */
export interface CreateDisputePayload {
    escrowId: string
    reason: string
    initiator: string
    evidenceUrls?: string[]
}

/**
 * Dispute resolution payload
 */
export interface ResolveDisputePayload {
    disputeId: string
    resolution: string
    mediator: string
    approverFunds: string
    serviceProviderFunds: string
}

/**
 * Add evidence payload
 */
export interface AddEvidencePayload {
    disputeId: string
    evidenceUrl: string
    description: string
    submittedBy: string
}

/**
 * Assign mediator payload
 */
export interface AssignMediatorPayload {
    disputeId: string
    mediatorAddress: string
}
