import { describe, expect, it, mock, spyOn } from 'bun:test';
import type { DisputeStatus, Dispute, DisputeEvidence } from '~/lib/types/escrow/dispute.types';
import type { EscrowRequestResponse } from '~/lib/types/escrow/escrow-response.types';

// Create a constant object with the dispute status values
const DISPUTE_STATUS = {
    PENDING: 'pending' as const,
    IN_REVIEW: 'in_review' as const,
    RESOLVED: 'resolved' as const,
    REJECTED: 'rejected' as const
};

// Mock the Supabase client
const mockSupabase = {
    from: () => ({
        insert: () => ({
            select: () => ({
                single: () => Promise.resolve({ 
                    data: { 
                        id: 'test-id',
                        escrowId: 'escrow-id',
                        status: DISPUTE_STATUS.PENDING,
                        reason: 'Test reason',
                        initiator: 'user123',
                        createdAt: { seconds: 1619712000, nanoseconds: 0 },
                        updatedAt: { seconds: 1619712000, nanoseconds: 0 }
                    } 
                })
            })
        }),
        select: () => ({
            eq: () => ({
                order: () => Promise.resolve({ 
                    data: [{ 
                        id: 'test-id',
                        escrowId: 'escrow-id',
                        status: DISPUTE_STATUS.PENDING,
                        reason: 'Test reason',
                        initiator: 'user123',
                        createdAt: { seconds: 1619712000, nanoseconds: 0 },
                        updatedAt: { seconds: 1619712000, nanoseconds: 0 }
                    }] 
                }),
                single: () => Promise.resolve({ 
                    data: { 
                        id: 'test-id',
                        escrowId: 'escrow-id',
                        status: DISPUTE_STATUS.PENDING,
                        reason: 'Test reason',
                        initiator: 'user123',
                        createdAt: { seconds: 1619712000, nanoseconds: 0 },
                        updatedAt: { seconds: 1619712000, nanoseconds: 0 }
                    } 
                })
            })
        }),
        update: () => ({
            eq: () => Promise.resolve({ 
                data: { 
                    id: 'test-id',
                    escrowId: 'escrow-id',
                    status: DISPUTE_STATUS.IN_REVIEW,
                    reason: 'Test reason',
                    initiator: 'user123',
                    createdAt: { seconds: 1619712000, nanoseconds: 0 },
                    updatedAt: { seconds: 1619712000, nanoseconds: 0 }
                } 
            })
        })
    })
};

// Mock createClient to return our mock Supabase client
mock.module('~/lib/supabase/client', () => ({
    createClient: () => mockSupabase
}));

// Mock the Stellar API
mock.module('~/lib/stellar/utils/create-escrow', () => ({
    createEscrowRequest: () => Promise.resolve({
        unsignedTransaction: 'mock-transaction',
        status: 'success'
    })
}));

describe('Escrow Dispute Service', () => {
    it('should create a dispute record', async () => {
        const { createDisputeRecord } = require('~/lib/services/escrow-dispute.service');
        const spy = spyOn(mockSupabase, 'from');
        
        const dispute = await createDisputeRecord({
            contractId: '0x123abc',
            reason: 'Service not delivered as promised',
            createdBy: 'user123',
            evidenceUrls: ['https://example.com/evidence1']
        }) as Dispute;
        
        expect(spy).toHaveBeenCalledWith('escrow_disputes');
        expect(dispute.id).toBe('test-id');
        expect(dispute.status).toBe(DISPUTE_STATUS.PENDING);
    });
    
    it('should get a dispute by ID', async () => {
        const { getDisputeById } = require('~/lib/services/escrow-dispute.service');
        const spy = spyOn(mockSupabase, 'from');
        
        const dispute = await getDisputeById('test-id') as Dispute;
        
        expect(spy).toHaveBeenCalledWith('escrow_disputes');
        expect(dispute.id).toBe('test-id');
    });
    
    it('should get disputes by escrow ID', async () => {
        const { getDisputesByEscrowId } = require('~/lib/services/escrow-dispute.service');
        const spy = spyOn(mockSupabase, 'from');
        
        const disputes = await getDisputesByEscrowId('escrow-id') as Dispute[];
        
        expect(spy).toHaveBeenCalledWith('escrow_disputes');
        expect(disputes.length).toBe(1);
        expect(disputes[0].id).toBe('test-id');
    });
    
    it('should update a dispute status', async () => {
        const { updateDisputeStatus } = require('~/lib/services/escrow-dispute.service');
        const spy = spyOn(mockSupabase, 'from');
        
        const result = await updateDisputeStatus('test-id', DISPUTE_STATUS.IN_REVIEW) as Dispute;
        
        expect(spy).toHaveBeenCalledWith('escrow_disputes');
        expect(result.id).toBe('test-id');
        expect(result.status).toBe(DISPUTE_STATUS.IN_REVIEW);
    });
    
    it('should add evidence to a dispute', async () => {
        const { addEvidence } = require('~/lib/services/escrow-dispute.service');
        const spy = spyOn(mockSupabase, 'from');
        
        const evidence = await addEvidence({
            disputeId: 'test-id',
            evidenceUrl: 'https://example.com/evidence',
            description: 'Screenshot of conversation',
            submittedBy: 'user123'
        }) as DisputeEvidence;
        
        expect(spy).toHaveBeenCalledWith('escrow_dispute_evidences');
        expect(evidence.id).toBe('test-id');
    });
    
    it('should start a dispute', async () => {
        const { startDispute } = require('~/lib/services/escrow-dispute.service');
        const createEscrowRequestSpy = spyOn(require('~/lib/stellar/utils/create-escrow'), 'createEscrowRequest');
        
        const result = await startDispute({
            contractId: '0x123abc',
            signer: 'user123'
        }) as EscrowRequestResponse;
        
        expect(createEscrowRequestSpy).toHaveBeenCalled();
        expect(result.unsignedTransaction).toBe('mock-transaction');
        expect(result.status).toBe('success');
    });
    
    it('should resolve a dispute', async () => {
        const { resolveDispute } = require('~/lib/services/escrow-dispute.service');
        const createEscrowRequestSpy = spyOn(require('~/lib/stellar/utils/create-escrow'), 'createEscrowRequest');
        
        const result = await resolveDispute({
            contractId: '0x123abc',
            disputeResolver: 'resolver123',
            approverFunds: '50',
            serviceProviderFunds: '50'
        }) as EscrowRequestResponse;
        
        expect(createEscrowRequestSpy).toHaveBeenCalled();
        expect(result.unsignedTransaction).toBe('mock-transaction');
        expect(result.status).toBe('success');
    });
    
    it('should assign a mediator to a dispute', async () => {
        const { assignMediator } = require('~/lib/services/escrow-dispute.service');
        const spy = spyOn(mockSupabase, 'from');
        
        const result = await assignMediator({
            disputeId: 'test-id',
            mediatorAddress: '0xabc123'
        }) as Dispute;
        
        expect(spy).toHaveBeenCalledWith('escrow_disputes');
        expect(result.id).toBe('test-id');
    });
});
