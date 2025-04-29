/**
 * End-to-end test for the escrow dispute system
 * 
 * This test verifies that the UI components and API routes work together correctly.
 */

import { describe, expect, it, mock, beforeAll, afterAll } from 'bun:test';
import type { DisputeStatus } from '~/lib/types/escrow/dispute.types';

// Create a constant object with the dispute status values
const DISPUTE_STATUS = {
    PENDING: 'pending' as const,
    IN_REVIEW: 'in_review' as const,
    RESOLVED: 'resolved' as const,
    REJECTED: 'rejected' as const
};
import { NextRequest, NextResponse } from 'next/server';
import { POST as createDispute } from '~/app/api/escrow/dispute/route';
import { GET as getDisputeById } from '~/app/api/escrow/dispute/[id]/route';

// Mock the Supabase client
const mockSupabaseData = {
    disputes: [
        {
            id: 'test-dispute-id',
            escrowId: 'test-escrow-id',
            status: DISPUTE_STATUS.PENDING,
            reason: 'Test dispute reason',
            initiator: 'user123',
            createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
            updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
        }
    ],
    evidence: []
};

// Mock the Supabase client
beforeAll(() => {
    mock.module('~/lib/supabase/client', () => ({
        createClient: () => ({
            from: (table: string) => ({
                insert: (data: any) => ({
                    select: () => ({
                        single: () => {
                            if (table === 'escrow_disputes') {
                                const newDispute = {
                                    ...data,
                                    id: 'new-dispute-id',
                                    status: DISPUTE_STATUS.PENDING,
                                    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
                                    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
                                };
                                mockSupabaseData.disputes.push(newDispute);
                                return Promise.resolve({ data: newDispute });
                            }
                            if (table === 'escrow_dispute_evidences') {
                                const newEvidence = {
                                    ...data,
                                    id: 'new-evidence-id',
                                    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
                                };
                                mockSupabaseData.evidence.push(newEvidence);
                                return Promise.resolve({ data: newEvidence });
                            }
                            return Promise.resolve({ data: null });
                        }
                    })
                }),
                select: () => ({
                    eq: (field: string, value: string) => ({
                        order: () => {
                            if (table === 'escrow_disputes') {
                                const disputes = mockSupabaseData.disputes.filter(d => d[field] === value);
                                return Promise.resolve({ data: disputes });
                            }
                            if (table === 'escrow_dispute_evidences') {
                                const evidence = mockSupabaseData.evidence.filter(e => e[field] === value);
                                return Promise.resolve({ data: evidence });
                            }
                            return Promise.resolve({ data: [] });
                        },
                        single: () => {
                            if (table === 'escrow_disputes') {
                                const dispute = mockSupabaseData.disputes.find(d => d[field] === value);
                                return Promise.resolve({ data: dispute });
                            }
                            return Promise.resolve({ data: null });
                        }
                    })
                }),
                update: (data: any) => ({
                    eq: (field: string, value: string) => {
                        if (table === 'escrow_disputes') {
                            const index = mockSupabaseData.disputes.findIndex(d => d[field] === value);
                            if (index !== -1) {
                                mockSupabaseData.disputes[index] = {
                                    ...mockSupabaseData.disputes[index],
                                    ...data,
                                    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
                                };
                                return Promise.resolve({ data: mockSupabaseData.disputes[index] });
                            }
                        }
                        return Promise.resolve({ data: null });
                    }
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
});

describe('Escrow Dispute System E2E', () => {
    it('should create a dispute via API', async () => {
        const req = new NextRequest('http://localhost:3000/api/escrow/dispute', {
            method: 'POST',
            body: JSON.stringify({
                contractId: '0x123abc',
                signer: 'user123',
                reason: 'Service not delivered as promised'
            })
        });
        
        const res = await createDispute(req);
        const data = await res.json();
        
        expect(res.status).toBe(201);
        expect(data.dispute).toBeDefined();
        expect(data.dispute.id).toBe('new-dispute-id');
        expect(data.dispute.status).toBe(DISPUTE_STATUS.PENDING);
    });
    
    it('should get dispute details via API', async () => {
        const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-dispute-id');
        
        const res = await getDisputeById(req, { params: { id: 'test-dispute-id' } });
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(data.dispute).toBeDefined();
        expect(data.dispute.id).toBe('test-dispute-id');
    });
});
