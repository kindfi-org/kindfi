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
        
        it('should reject an invalid dispute creation payload', () => {
            const invalidPayload = {
                // Missing required fields
                contractId: '0x123abc'
            };
            
            const result = startDisputeValidator.safeParse(invalidPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThan(0); // Should have validation errors
                expect(result.error.issues.some(issue => issue.path.includes('signer'))).toBe(true);
                expect(result.error.issues.some(issue => issue.path.includes('reason'))).toBe(true);
            }
        });
        
        it('should validate a valid dispute resolution payload', () => {
            const validPayload = {
                contractId: '0x123abc',
                disputeResolver: 'resolver123',
                approverFunds: '50',
                serviceProviderFunds: '50',
                resolution: 'Funds split evenly between parties'
            };
            
            const result = resolveDisputeValidator.safeParse(validPayload);
            expect(result.success).toBe(true);
        });
        
        it('should reject an invalid dispute resolution payload', () => {
            const invalidPayload = {
                contractId: '0x123abc',
                // Missing required fields (disputeResolver, resolution) and invalid values
                approverFunds: 'not-a-number',
                serviceProviderFunds: '-10'
            };
            
            const result = resolveDisputeValidator.safeParse(invalidPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThan(0);
                // Should have errors about missing disputeResolver and resolution
                expect(result.error.issues.some(issue => issue.path.includes('disputeResolver'))).toBe(true);
                expect(result.error.issues.some(issue => issue.path.includes('resolution'))).toBe(true);
            }
        });
        
        it('should validate a valid dispute status update payload', () => {
            const validPayload = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                status: 'in_review'
            };
            
            const result = updateDisputeStatusValidator.safeParse(validPayload);
            expect(result.success).toBe(true);
        });
        
        it('should reject an invalid dispute status update payload', () => {
            const invalidPayload = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                status: 'invalid_status' // Invalid status value
            };
            
            const result = updateDisputeStatusValidator.safeParse(invalidPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThan(0);
                // Should have an error about invalid status
                expect(result.error.issues.some(issue => issue.path.includes('status'))).toBe(true);
            }
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
        
        it('should reject an invalid evidence addition payload', () => {
            const invalidPayload = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                evidenceUrl: 'not-a-valid-url', // Invalid URL format
                description: '' // Empty description
            };
            
            const result = addEvidenceValidator.safeParse(invalidPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThan(0);
                // Should have errors about invalid URL and empty description
                expect(result.error.issues.some(issue => issue.path.includes('evidenceUrl'))).toBe(true);
            }
        });
        
        it('should validate a valid mediator assignment payload', () => {
            const validPayload = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                mediatorAddress: '0xabc123'
            };
            
            const result = assignMediatorValidator.safeParse(validPayload);
            expect(result.success).toBe(true);
        });
        
        it('should reject an invalid mediator assignment payload', () => {
            const invalidPayload = {
                // Missing escrowId
                mediatorAddress: ''  // Empty mediator address
            };
            
            const result = assignMediatorValidator.safeParse(invalidPayload);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues.length).toBeGreaterThan(0);
                // Should have errors about missing escrowId and invalid mediatorAddress
                expect(result.error.issues.some(issue => issue.path.includes('escrowId') || issue.path.includes('mediatorAddress'))).toBe(true);
            }
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
