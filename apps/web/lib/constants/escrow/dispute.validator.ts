import { z } from 'zod'

/**
 * Validator for starting a dispute
 */
export const startDisputeValidator = z.object({
    contractId: z.string().min(1, 'Contract ID is required'),
    signer: z.string().min(1, 'Signer is required'),
    reason: z.string().min(1, 'Reason for dispute is required'),
    evidenceUrls: z.array(z.string().url('Invalid URL format')).optional()
})

/**
 * Validator for resolving a dispute
 */
export const resolveDisputeValidator = z.object({
    contractId: z.string().min(1, 'Contract ID is required'),
    disputeResolver: z.string().min(1, 'Dispute resolver is required'),
    approverFunds: z.string().min(1, 'Approver funds amount is required'),
    serviceProviderFunds: z.string().min(1, 'Service provider funds amount is required'),
    resolution: z.string().min(1, 'Resolution description is required')
})

/**
 * Validator for updating dispute status
 */
export const updateDisputeStatusValidator = z.object({
    escrowId: z.string().min(1, 'Escrow ID is required'),
    status: z.string().min(1, 'Status is required')
})

/**
 * Validator for assigning a mediator
 */
export const assignMediatorValidator = z.object({
    escrowId: z.string().min(1, 'Escrow ID is required'),
    mediatorAddress: z.string().min(1, 'Mediator address is required')
})

/**
 * Validator for adding evidence to a dispute
 */
export const addEvidenceValidator = z.object({
    escrowId: z.string().min(1, 'Escrow ID is required'),
    evidenceUrl: z.string().url('Invalid URL format'),
    description: z.string().min(1, 'Evidence description is required')
})
