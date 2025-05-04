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
        .refine((val) => Number(val) >= 0, 'Amount must be a non-negative number')
        .describe('Amount allocated to the approver'),
    serviceProviderAmount: z
        .string()
        .min(1, 'Service provider amount is required')
        .refine((val) => !Number.isNaN(Number(val)), 'Must be a valid number')
        .refine((val) => Number(val) >= 0, 'Amount must be a non-negative number')
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

// Define the shape of the dispute sign schema first to avoid circular references
type DisputeSignSchemaShape = {
    signedTransaction: z.ZodString;
    type: z.ZodEnum<['file', 'resolve']>;
    // For filing a dispute - required if type is 'file'
    escrowId: z.ZodOptional<z.ZodString>;
    milestoneId: z.ZodOptional<z.ZodString>;
    filerAddress: z.ZodOptional<z.ZodString>;
    disputeReason: z.ZodOptional<z.ZodString>;
    evidenceUrls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    escrowParticipantId: z.ZodOptional<z.ZodString>;
    // For resolving a dispute - required if type is 'resolve'
    disputeId: z.ZodOptional<z.ZodString>;
    mediatorId: z.ZodOptional<z.ZodString>;
    resolution: z.ZodOptional<z.ZodEnum<['APPROVED', 'REJECTED', 'RESOLVED']>>;
    resolutionNotes: z.ZodOptional<z.ZodString>;
    approverAmount: z.ZodOptional<z.ZodString>;
    serviceProviderAmount: z.ZodOptional<z.ZodString>;
    escrowContractAddress: z.ZodOptional<z.ZodString>;
};

// Type for the data passed to validation functions
type DisputeSignData = {
    signedTransaction: string;
    type: 'file' | 'resolve';
    escrowId?: string;
    milestoneId?: string;
    filerAddress?: string;
    disputeReason?: string;
    evidenceUrls?: string[];
    escrowParticipantId?: string;
    disputeId?: string;
    mediatorId?: string;
    resolution?: 'APPROVED' | 'REJECTED' | 'RESOLVED';
    resolutionNotes?: string;
    approverAmount?: string;
    serviceProviderAmount?: string;
    escrowContractAddress?: string;
};

// Dispute sign schema for the new sign endpoint
export const disputeSignSchema = z.object({
    signedTransaction: z.string().min(1, 'Signed transaction is required'),
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
        .enum(['APPROVED', 'REJECTED', 'RESOLVED'] as const, {
            required_error: 'Resolution status is required',
            invalid_type_error: 'Invalid resolution status',
        })
        .optional()
        .describe('Resolution decision'),
    resolutionNotes: z.string().optional().describe('Notes explaining the resolution'),
    approverAmount: z
        .string()
        .optional()
        .refine((val) => val === undefined || !Number.isNaN(Number(val)), 'Must be a valid number')
        .refine((val) => val === undefined || Number(val) >= 0, 'Amount must be a non-negative number')
        .describe('Amount allocated to the approver'),
    serviceProviderAmount: z
        .string()
        .optional()
        .refine((val) => val === undefined || !Number.isNaN(Number(val)), 'Must be a valid number')
        .refine((val) => val === undefined || Number(val) >= 0, 'Amount must be a non-negative number')
        .describe('Amount allocated to the service provider'),
    escrowContractAddress: addressValidator.optional().describe('Escrow contract address'),
}).refine(
    (data) => {
        const isFileTypeComplete = (data: DisputeSignData): boolean => {
            return !!data.escrowId && !!data.milestoneId && !!data.filerAddress && 
                   !!data.disputeReason && !!data.escrowParticipantId;
        };
        
        const isResolveTypeComplete = (data: DisputeSignData): boolean => {
            return !!data.disputeId && !!data.mediatorId && !!data.resolution && 
                   !!data.resolutionNotes && !!data.approverAmount && !!data.serviceProviderAmount;
        };

        // If type is 'file', require file-specific fields
        if (data.type === 'file') {
            return isFileTypeComplete(data);
        }
        // If type is 'resolve', require resolve-specific fields
        if (data.type === 'resolve') {
            return isResolveTypeComplete(data);
        }
        return false;
    },
    {
        message: (data) => data.type === 'file'
            ? 'Filing a dispute requires escrowId, milestoneId, filerAddress, disputeReason, and escrowParticipantId'
            : 'Resolving a dispute requires disputeId, mediatorId, resolution, resolutionNotes, approverAmount, and serviceProviderAmount',
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
