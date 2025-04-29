/**
 * Integration test for the escrow dispute system
 * 
 * This test verifies that the dispute components, API routes, and services work together correctly.
 */

import { describe, expect, it, mock, spyOn } from 'bun:test';
import type { DisputeStatus } from '~/lib/types/escrow/dispute.types';
import type { CreatedAt } from '~/lib/types/date.types';

// Create a constant object with the dispute status values
const DISPUTE_STATUS = {
    PENDING: 'pending' as const,
    IN_REVIEW: 'in_review' as const,
    RESOLVED: 'resolved' as const,
    REJECTED: 'rejected' as const
};

// Define interfaces for the data structures
interface DisputeData {
    id: string;
    escrowId: string;
    status: string;
    reason: string;
    initiator: string;
    mediator?: string;
    resolution?: string;
    createdAt: CreatedAt;
    updatedAt: CreatedAt;
    resolvedAt?: CreatedAt;
}

// Create timestamp helper function
const createTimestamp = (): CreatedAt => ({
    seconds: Date.now() / 1000,
    nanoseconds: 0
});

// Define mock dispute data
const MOCK_PENDING_DISPUTE: DisputeData = {
    id: 'test-dispute-id',
    escrowId: 'test-escrow-id',
    status: DISPUTE_STATUS.PENDING,
    reason: 'Test dispute reason',
    initiator: 'user123',
    createdAt: createTimestamp(),
    updatedAt: createTimestamp()
};

// Define mock dispute data for updated status
const MOCK_IN_REVIEW_DISPUTE: DisputeData = {
    ...MOCK_PENDING_DISPUTE,
    status: DISPUTE_STATUS.IN_REVIEW,
    updatedAt: createTimestamp()
};

// Mock the Supabase client
mock.module('~/lib/supabase/client', () => ({
    createClient: () => ({
        from: () => ({
            insert: () => ({
                select: () => ({
                    single: () => Promise.resolve({ 
                        data: MOCK_PENDING_DISPUTE
                    })
                })
            }),
            select: () => ({
                eq: () => ({
                    order: () => Promise.resolve({ 
                        data: [MOCK_PENDING_DISPUTE] 
                    }),
                    single: () => Promise.resolve({ 
                        data: MOCK_PENDING_DISPUTE 
                    })
                })
            }),
            update: () => ({
                eq: () => Promise.resolve({ 
                    data: MOCK_IN_REVIEW_DISPUTE 
                })
            }),
            delete: () => ({
                eq: () => Promise.resolve({ status: 204 })
            })
        })
    })
}));

// Mock the Stellar API
mock.module('~/lib/stellar/utils/create-escrow', () => ({
    createEscrowRequest: () => Promise.resolve({
        unsignedTransaction: 'mock-unsigned-transaction',
        status: 'success'
    })
}));

describe('Escrow Dispute System Integration', () => {
    it('should be able to import all necessary components', () => {
        // This test verifies that all the necessary components can be imported without errors
        const { createDisputeRecord } = require('~/lib/services/escrow-dispute.service');
        const { startDisputeValidator } = require('~/lib/constants/escrow/dispute.validator');
        const { DisputeStatus } = require('~/lib/types/escrow/dispute.types');
        
        expect(createDisputeRecord).toBeDefined();
        expect(startDisputeValidator).toBeDefined();
        expect(DisputeStatus).toBeDefined();
    });
    
    it('should be able to create a dispute', async () => {
        const { createDisputeRecord } = require('~/lib/services/escrow-dispute.service');
        
        const dispute = await createDisputeRecord({
            escrowId: '0x123abc',
            reason: 'Service not delivered as promised',
            initiator: 'user123',
            evidenceUrls: ['https://example.com/evidence1']
        });
        
        expect(dispute).toBeDefined();
        expect(dispute.id).toBe('test-dispute-id');
        expect(dispute.status).toBe(DISPUTE_STATUS.PENDING);
    });
    
    it('should be able to get disputes by escrow ID', async () => {
        const { getDisputesByEscrowId } = require('~/lib/services/escrow-dispute.service');
        
        const disputes = await getDisputesByEscrowId('test-escrow-id');
        
        expect(disputes).toBeDefined();
        expect(disputes.length).toBe(1);
        expect(disputes[0].id).toBe('test-dispute-id');
    });
    
    it('should be able to update dispute status', async () => {
        const { updateDisputeStatus } = require('~/lib/services/escrow-dispute.service');
        
        const dispute = await updateDisputeStatus('test-dispute-id', DISPUTE_STATUS.IN_REVIEW);
        
        expect(dispute).toBeDefined();
        expect(dispute.id).toBe('test-dispute-id');
        expect(dispute.status).toBe(DISPUTE_STATUS.IN_REVIEW);
    });
});
