/**
 * Simplified End-to-end test for the escrow dispute system
 * 
 * This test verifies that the UI components and API routes work together correctly.
 */

import { describe, expect, it, mock, beforeAll } from 'bun:test';
import { NextRequest } from 'next/server';
import type { DisputeStatus } from '~/lib/types/escrow/dispute.types';

// Create a type-safe object with the dispute status values
const DISPUTE_STATUS: Record<string, DisputeStatus> = {
    PENDING: 'pending',
    IN_REVIEW: 'in_review',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
};

// Mock database for storing test data
const mockDb = {
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
                insert: (data: Record<string, unknown>) => ({
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
                                mockDb.disputes.push(newDispute);
                                return Promise.resolve({ data: newDispute });
                            }
                            if (table === 'escrow_dispute_evidences') {
                                const newEvidence = {
                                    ...data,
                                    id: 'new-evidence-id',
                                    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
                                };
                                mockDb.evidence.push(newEvidence);
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
                                // Use a type-safe approach to filter disputes
                                const disputes = mockDb.disputes.filter(d => {
                                    if (field === 'id' && d.id === value) return true;
                                    if (field === 'escrowId' && d.escrowId === value) return true;
                                    return false;
                                });
                                return Promise.resolve({ data: disputes });
                            }
                            if (table === 'escrow_dispute_evidences') {
                                // Use a type-safe approach to filter evidence
                                const evidence = mockDb.evidence.filter(e => {
                                    if (field === 'id' && e.id === value) return true;
                                    if (field === 'disputeId' && e.disputeId === value) return true;
                                    return false;
                                });
                                return Promise.resolve({ data: evidence });
                            }
                            return Promise.resolve({ data: [] });
                        },
                        single: () => {
                            if (table === 'escrow_disputes') {
                                // Use a type-safe approach to find a dispute
                                const dispute = mockDb.disputes.find(d => {
                                    if (field === 'id' && d.id === value) return true;
                                    if (field === 'escrowId' && d.escrowId === value) return true;
                                    return false;
                                });
                                return Promise.resolve({ data: dispute });
                            }
                            return Promise.resolve({ data: null });
                        }
                    })
                }),
                update: (data: Record<string, unknown>) => ({
                    eq: (field: string, value: string) => {
                        if (table === 'escrow_disputes') {
                            // Use a type-safe approach to update a dispute
                            const index = mockDb.disputes.findIndex(d => {
                                if (field === 'id' && d.id === value) return true;
                                return false;
                            });
                            if (index !== -1) {
                                mockDb.disputes[index] = {
                                    ...mockDb.disputes[index],
                                    ...data,
                                    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
                                };
                                return Promise.resolve({ data: mockDb.disputes[index] });
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
        // Import the route handler
        const { POST } = await import('~/app/api/escrow/dispute/route');
        
        const req = new NextRequest('http://localhost:3000/api/escrow/dispute', {
            method: 'POST',
            body: JSON.stringify({
                contractId: '0x123abc',
                signer: 'user123',
                reason: 'Service not delivered as promised'
            })
        });
        
        const res = await POST(req);
        const data = await res.json();
        
        expect(res.status).toBe(201);
        expect(data.dispute).toBeDefined();
        expect(data.dispute.id).toBe('new-dispute-id');
        expect(data.dispute.status).toBe(DISPUTE_STATUS.PENDING);
    });
    
    it('should get dispute details via API', async () => {
        // Import the route handler
        const { GET } = await import('~/app/api/escrow/dispute/[id]/route');
        
        const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-dispute-id');
        
        const res = await GET(req, { params: { id: 'test-dispute-id' } });
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(data.dispute).toBeDefined();
        expect(data.dispute.id).toBe('test-dispute-id');
    });
});
