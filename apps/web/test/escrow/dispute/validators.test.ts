import { describe, expect, it } from 'bun:test';
import {
    startDisputeValidator,
    resolveDisputeValidator,
    updateDisputeStatusValidator,
    addEvidenceValidator,
    assignMediatorValidator
} from '~/lib/constants/escrow/dispute.validator';

describe('Dispute Validators', () => {
    describe('startDisputeValidator', () => {
        it('should validate valid input', () => {
            const validInput = {
                contractId: '0x123abc',
                signer: 'user123',
                reason: 'Service not delivered as promised',
                evidenceUrls: ['https://example.com/evidence1']
            };
            
            const result = startDisputeValidator.safeParse(validInput);
            expect(result.success).toBe(true);
        });
        
        it('should validate valid input without optional fields', () => {
            const validInput = {
                contractId: '0x123abc',
                signer: 'user123',
                reason: 'Service not delivered as promised'
            };
            
            const result = startDisputeValidator.safeParse(validInput);
            expect(result.success).toBe(true);
        });
        
        it('should reject invalid input - missing contractId', () => {
            const invalidInput = {
                signer: 'user123',
                reason: 'Service not delivered as promised'
            };
            
            const result = startDisputeValidator.safeParse(invalidInput);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toContain('required');
            }
        });
        
        it('should reject invalid input - invalid URL', () => {
            const invalidInput = {
                contractId: '0x123abc',
                signer: 'user123',
                reason: 'Service not delivered as promised',
                evidenceUrls: ['not-a-url']
            };
            
            const result = startDisputeValidator.safeParse(invalidInput);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.errors[0].message).toContain('URL');
            }
        });
    });
    
    describe('resolveDisputeValidator', () => {
        it('should validate valid input', () => {
            const validInput = {
                contractId: '0x123abc',
                disputeResolver: 'resolver123',
                approverFunds: '50',
                serviceProviderFunds: '50',
                resolution: 'Both parties agreed to split the funds'
            };
            
            const result = resolveDisputeValidator.safeParse(validInput);
            expect(result.success).toBe(true);
        });
        
        it('should reject invalid input - missing required fields', () => {
            const invalidInput = {
                contractId: '0x123abc',
                disputeResolver: 'resolver123'
            };
            
            const result = resolveDisputeValidator.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });
    
    describe('updateDisputeStatusValidator', () => {
        it('should validate valid input', () => {
            const validInput = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                status: 'in_review'
            };
            
            const result = updateDisputeStatusValidator.safeParse(validInput);
            expect(result.success).toBe(true);
        });
        
        it('should reject invalid input - empty status', () => {
            const invalidInput = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                status: ''
            };
            
            const result = updateDisputeStatusValidator.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });
    
    describe('addEvidenceValidator', () => {
        it('should validate valid input', () => {
            const validInput = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                evidenceUrl: 'https://example.com/evidence',
                description: 'Screenshot of conversation'
            };
            
            const result = addEvidenceValidator.safeParse(validInput);
            expect(result.success).toBe(true);
        });
        
        it('should reject invalid input - invalid URL', () => {
            const invalidInput = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                evidenceUrl: 'not-a-url',
                description: 'Screenshot of conversation'
            };
            
            const result = addEvidenceValidator.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });
    
    describe('assignMediatorValidator', () => {
        it('should validate valid input', () => {
            const validInput = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                mediatorAddress: '0xabc123'
            };
            
            const result = assignMediatorValidator.safeParse(validInput);
            expect(result.success).toBe(true);
        });
        
        it('should reject invalid input - empty mediator address', () => {
            const invalidInput = {
                escrowId: '123e4567-e89b-12d3-a456-426614174000',
                mediatorAddress: ''
            };
            
            const result = assignMediatorValidator.safeParse(invalidInput);
            expect(result.success).toBe(false);
        });
    });
});
