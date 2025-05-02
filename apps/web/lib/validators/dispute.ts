import { z } from 'zod';

// Common validators
const uuidValidator = z.string().uuid('Must be a valid UUID');
const addressValidator = z.string().min(1, 'Address is required');
const nonEmptyString = z.string().min(1, 'This field is required');
const signerValidator = z.string().min(1, 'Signer is required');

// Dispute filing schema
export const disputeSchema = z.object({
    escrowId: uuidValidator.describe('Escrow contract ID'),
    milestoneId: uuidValidator.describe('Milestone ID'),
    filerAddress: addressValidator.describe('Address of the dispute filer'),
    disputeReason: nonEmptyString.describe('Reason for filing the dispute'),
    evidenceUrls: z
        .array(z.string().url('Must be a valid URL'))
        .optional()
        .describe('URLs to evidence supporting the dispute'),
    signer: signerValidator.describe('Transaction signer'),
    escrowContractAddress: addressValidator.describe('Escrow contract address'),
});

// Dispute resolution schema
export const disputeResolutionSchema = z.object({
    disputeId: uuidValidator.describe('Dispute ID'),
    mediatorId: uuidValidator.describe('Mediator ID'),
    resolution: z
        .enum(['APPROVED', 'REJECTED', 'RESOLVED'] as const, {
            required_error: 'Resolution status is required',
            invalid_type_error: 'Invalid resolution status',
        })
        .describe('Resolution decision'),
    resolutionNotes: nonEmptyString.describe('Notes explaining the resolution'),
    approverAmount: z
        .string()
        .min(1, 'Approver amount is required')
        .refine((val) => !Number.isNaN(Number(val)), 'Must be a valid number')
        .describe('Amount allocated to the approver'),
    serviceProviderAmount: z
        .string()
        .min(1, 'Service provider amount is required')
        .refine((val) => !Number.isNaN(Number(val)), 'Must be a valid number')
        .describe('Amount allocated to the service provider'),
    signer: signerValidator.describe('Transaction signer'),
    escrowContractAddress: addressValidator.describe('Escrow contract address'),
});

// Mediator assignment schema
export const mediatorAssignmentSchema = z.object({
    disputeId: uuidValidator.describe('Dispute ID'),
    mediatorId: uuidValidator.describe('Mediator ID'),
    assignedById: uuidValidator.describe(
        'ID of the user assigning the mediator'
    ),
});

// Evidence submission schema
export const evidenceSubmissionSchema = z.object({
    disputeId: uuidValidator.describe('Dispute ID'),
    submitterAddress: addressValidator.describe(
        'Address of the evidence submitter'
    ),
    evidenceType: z.enum(
        ['DOCUMENT', 'IMAGE', 'VIDEO', 'LINK', 'TEXT'] as const,
        {
            required_error: 'Evidence type is required',
            invalid_type_error: 'Invalid evidence type',
        }
    ),
    evidenceUrl: z
        .string()
        .url('Must be a valid URL')
        .describe('URL to the evidence'),
    description: nonEmptyString.describe('Description of the evidence'),
});

// Dispute sign schema for the new sign endpoint
export const disputeSignSchema = z.object({
    unsignedTransaction: z.string().min(1, 'Unsigned transaction is required'),
    signer: signerValidator.describe('Transaction signer'),
    type: z.enum(['file', 'resolve']).describe('Transaction type'),
    // For filing a dispute - required if type is 'file'
    escrowId: uuidValidator.optional().describe('Escrow contract ID'),
    milestoneId: uuidValidator.optional().describe('Milestone ID'),
    filerAddress: addressValidator.optional().describe('Address of the dispute filer'),
    disputeReason: z.string().optional().describe('Reason for filing the dispute'),
    evidenceUrls: z
        .array(z.string().url('Must be a valid URL'))
        .optional()
        .describe('URLs to evidence supporting the dispute'),
    escrowParticipantId: uuidValidator.optional().describe('Escrow participant ID'),
    // For resolving a dispute - required if type is 'resolve'
    disputeId: uuidValidator.optional().describe('Dispute ID'),
    mediatorId: uuidValidator.optional().describe('Mediator ID'),
    resolution: z
        .enum(['APPROVED', 'REJECTED', 'RESOLVED'] as const)
        .optional()
        .describe('Resolution decision'),
    resolutionNotes: z.string().optional().describe('Notes explaining the resolution'),
    approverAmount: z
        .string()
        .optional()
        .describe('Amount allocated to the approver'),
    serviceProviderAmount: z
        .string()
        .optional()
        .describe('Amount allocated to the service provider'),
    escrowContractAddress: addressValidator.optional().describe('Escrow contract address'),
}).refine(
    (data) => {
        // If type is 'file', require file-specific fields
        if (data.type === 'file') {
            return !!data.escrowId && !!data.milestoneId && !!data.filerAddress && !!data.disputeReason && !!data.escrowParticipantId;
        }
        // If type is 'resolve', require resolve-specific fields
        if (data.type === 'resolve') {
            return !!data.disputeId && !!data.mediatorId && !!data.resolution && !!data.resolutionNotes && !!data.approverAmount && !!data.serviceProviderAmount;
        }
        return false;
    },
    {
        message: 'Required fields missing for the specified transaction type',
        path: ['type'],
    }
);

// Type definitions for inferred types
export type DisputeSchemaType = z.infer<typeof disputeSchema>;
export type DisputeResolutionSchemaType = z.infer<typeof disputeResolutionSchema>;
export type MediatorAssignmentSchemaType = z.infer<typeof mediatorAssignmentSchema>;
export type EvidenceSubmissionSchemaType = z.infer<typeof evidenceSubmissionSchema>;
export type DisputeSignSchemaType = z.infer<typeof disputeSignSchema>;

// Validation functions
export function validateDispute(data: unknown) {
    return disputeSchema.safeParse(data);
}

export function validateDisputeResolution(data: unknown) {
    return disputeResolutionSchema.safeParse(data);
}

export function validateMediatorAssignment(data: unknown) {
    return mediatorAssignmentSchema.safeParse(data);
}

export function validateEvidenceSubmission(data: unknown) {
    return evidenceSubmissionSchema.safeParse(data);
}

export function validateDisputeSign(data: unknown) {
    return disputeSignSchema.safeParse(data);
}
