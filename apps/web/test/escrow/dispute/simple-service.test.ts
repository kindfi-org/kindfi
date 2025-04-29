import { describe, expect, it, mock, spyOn } from 'bun:test';
import type { DisputeStatus, Dispute, DisputeEvidence } from '~/lib/types/escrow/dispute.types';
import type { EscrowRequestResponse } from '~/lib/types/escrow/escrow-response.types';
import type { CreatedAt } from '~/lib/types/date.types';

// Create a constant object with the dispute status values
const DISPUTE_STATUS = {
    PENDING: 'pending' as const,
    IN_REVIEW: 'in_review' as const,
    RESOLVED: 'resolved' as const,
    REJECTED: 'rejected' as const
};

// Helper function to create a timestamp
const createTimestamp = (time = Date.now()): CreatedAt => ({
    seconds: time / 1000,
    nanoseconds: 0
});

// Mock factory for creating dispute data with different states
interface DisputeDataOptions {
    id?: string;
    escrowId?: string;
    status?: DisputeStatus;
    reason?: string;
    initiator?: string;
    mediator?: string;
    resolution?: string;
    createdAt?: CreatedAt;
    updatedAt?: CreatedAt;
    resolvedAt?: CreatedAt;
}

const createMockDispute = (options: DisputeDataOptions = {}): Dispute => ({
    id: options.id || 'test-id',
    escrowId: options.escrowId || 'escrow-id',
    status: options.status || DISPUTE_STATUS.PENDING,
    reason: options.reason || 'Test reason',
    initiator: options.initiator || 'user123',
    mediator: options.mediator,
    resolution: options.resolution,
    createdAt: options.createdAt || createTimestamp(),
    updatedAt: options.updatedAt || createTimestamp(),
    resolvedAt: options.resolvedAt ? options.resolvedAt : undefined
});

// Mock factory for creating evidence data
interface EvidenceDataOptions {
    id?: string;
    disputeId?: string;
    evidenceUrl?: string;
    description?: string;
    submittedBy?: string;
    createdAt?: CreatedAt;
}

const createMockEvidence = (options: EvidenceDataOptions = {}): DisputeEvidence => ({
    id: options.id || 'evidence-id',
    escrowDisputeId: options.disputeId || 'test-id',
    evidenceUrl: options.evidenceUrl || 'https://example.com/evidence',
    description: options.description || 'Test evidence description',
    submittedBy: options.submittedBy || 'user123',
    createdAt: options.createdAt || createTimestamp()
});

// Create different dispute scenarios for testing
const MOCK_DISPUTES = {
    PENDING: createMockDispute(),
    IN_REVIEW: createMockDispute({ status: DISPUTE_STATUS.IN_REVIEW, mediator: 'mediator123' }),
    RESOLVED: createMockDispute({
        status: DISPUTE_STATUS.RESOLVED,
        mediator: 'mediator123',
        resolution: 'Dispute resolved in favor of the service provider',
        resolvedAt: createTimestamp()
    }),
    REJECTED: createMockDispute({ status: DISPUTE_STATUS.REJECTED })
};

// Helper function to create Supabase response wrappers
const wrapResponse = <T>(data: T) => Promise.resolve({ data });
const wrapSingleResponse = <T>(data: T) => Promise.resolve({ data });
const wrapArrayResponse = <T>(data: T[]) => Promise.resolve({ data });

// Create a configurable mock Supabase client
const createMockSupabaseClient = (disputeData = MOCK_DISPUTES.PENDING, evidenceData = createMockEvidence()) => ({
    from: (table: string) => {
        // Different behavior based on the table being accessed
        if (table === 'escrow_disputes') {
            return {
                insert: <T>(data: Partial<T>) => ({
                    select: () => ({
                        single: () => wrapSingleResponse(disputeData)
                    })
                }),
                select: () => ({
                    eq: () => ({
                        order: () => wrapArrayResponse([disputeData]),
                        single: () => wrapSingleResponse(disputeData)
                    })
                }),
                update: () => ({
                    eq: () => wrapSingleResponse(MOCK_DISPUTES.IN_REVIEW)
                })
            };
        } else if (table === 'escrow_dispute_evidences') {
            return {
                insert: <T>(data: Partial<T>) => ({
                    select: () => ({
                        single: () => wrapSingleResponse(evidenceData)
                    })
                }),
                select: () => ({
                    eq: () => wrapArrayResponse([evidenceData])
                })
            };
        }
        
        // Default fallback
        return {
            insert: () => ({ select: () => ({ single: () => wrapSingleResponse({}) }) }),
            select: () => ({ eq: () => ({ order: () => wrapArrayResponse([]), single: () => wrapSingleResponse({}) }) }),
            update: () => ({ eq: () => wrapSingleResponse({}) })
        };
    }
});

// Create the mock Supabase client instance
const mockSupabase = createMockSupabaseClient();

// Mock createClient to return our mock Supabase client
mock.module('~/lib/supabase/client', () => ({
    createClient: () => mockSupabase
}));

// Mock the Stellar API with configurable responses
const createMockStellarResponse = (options: Partial<EscrowRequestResponse> = {}): EscrowRequestResponse => ({
    status: options.status || 'SUCCESS',
    unsignedTransaction: options.unsignedTransaction || 'mock-transaction'
});

// Set up the Stellar API mock
mock.module('~/lib/stellar/utils/create-escrow', () => ({
    createEscrowRequest: () => Promise.resolve(createMockStellarResponse())
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
        expect(evidence.evidenceUrl).toBe('https://example.com/evidence');
        expect(evidence.description).toBe('Screenshot of conversation');
        expect(evidence.submittedBy).toBe('user123');
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
