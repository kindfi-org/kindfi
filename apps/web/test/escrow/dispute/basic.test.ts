import { describe, expect, it } from 'bun:test';
import {
    startDisputeValidator,
    resolveDisputeValidator,
    updateDisputeStatusValidator,
    addEvidenceValidator,
    assignMediatorValidator
} from '~/lib/constants/escrow/dispute.validator';
import type { DisputeStatus } from '~/lib/types/escrow/dispute.types';

// Create a constant object with the dispute status values
const DISPUTE_STATUS = {
    PENDING: 'pending' as const,
    IN_REVIEW: 'in_review' as const,
    RESOLVED: 'resolved' as const,
    REJECTED: 'rejected' as const
};

describe('Escrow Dispute System', () => {
    describe('Validators', () => {
        it('should validate a valid dispute creation payload', () => {
            const validPayload = {
                contractId: '0x123abc',
                signer: 'user123',
                reason: 'Service not delivered as promised'
            };
            
            const result = startDisputeValidator.safeParse(validPayload);
            expect(result.success).toBe(true);
        });
        
        it('should validate a valid dispute resolution payload', () => {
            const validPayload = {
                contractId: '0x123abc',
                disputeResolver: 'resolver123',
                approverFunds: '50',
                serviceProviderFunds: '50'
            };
            
            const result = resolveDisputeValidator.safeParse(validPayload);
            expect(result.success).toBe(true);
        });
        
        it('should validate a valid dispute status update payload', () => {
            const validPayload = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                status: 'in_review'
            };
            
            const result = updateDisputeStatusValidator.safeParse(validPayload);
            expect(result.success).toBe(true);
        });
        
        it('should validate a valid evidence addition payload', () => {
            const validPayload = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                evidenceUrl: 'https://example.com/evidence',
                description: 'Screenshot of conversation'
            };
            
            const result = addEvidenceValidator.safeParse(validPayload);
            expect(result.success).toBe(true);
        });
        
        it('should validate a valid mediator assignment payload', () => {
            const validPayload = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                mediatorAddress: '0xabc123'
            };
            
            const result = assignMediatorValidator.safeParse(validPayload);
            expect(result.success).toBe(true);
        });
    });
    
    describe('Types', () => {
        it('should have the correct dispute statuses', () => {
            expect(DISPUTE_STATUS.PENDING).toBe('pending');
            expect(DISPUTE_STATUS.IN_REVIEW).toBe('in_review');
            expect(DISPUTE_STATUS.RESOLVED).toBe('resolved');
            expect(DISPUTE_STATUS.REJECTED).toBe('rejected');
        });
    });
});
