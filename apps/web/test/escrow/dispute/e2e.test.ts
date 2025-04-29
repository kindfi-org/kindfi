/**
 * End-to-end test for the escrow dispute system
 * 
 * This test verifies that the UI components and API routes work together correctly.
 */

import { describe, expect, it, mock, beforeAll, afterAll } from 'bun:test';
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
    escrowId: string;
    reason: string;
    initiator: string;
    status?: string;
    mediator?: string;
    resolution?: string;
    [key: string]: any; // For other properties
}

interface EvidenceData {
    escrow_dispute_id: string;
    evidenceUrl: string;
    description: string;
    submitted_by: string;
    [key: string]: any; // For other properties
}

interface Dispute extends DisputeData {
    id: string;
    status: string;
    createdAt: CreatedAt;
    updatedAt: CreatedAt;
    resolvedAt?: CreatedAt;
}

interface Evidence extends EvidenceData {
    id: string;
    createdAt: CreatedAt;
}
import { NextRequest, NextResponse } from 'next/server';
import { POST as createDispute } from '~/app/api/escrow/dispute/route';
import { GET as getDisputeById } from '~/app/api/escrow/dispute/[id]/route';

// Mock the Supabase client
const mockSupabaseData: {
    disputes: Dispute[];
    evidence: Evidence[];
} = {
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
                insert: (data: DisputeData | EvidenceData) => ({
                    select: () => ({
                        single: () => {
                            if (table === 'escrow_disputes') {
                                const disputeData = data as DisputeData;
                                const newDispute: Dispute = {
                                    ...disputeData,
                                    id: 'new-dispute-id',
                                    status: disputeData.status || DISPUTE_STATUS.PENDING,
                                    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
                                    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 }
                                };
                                mockSupabaseData.disputes.push(newDispute);
                                return Promise.resolve({ data: newDispute });
                            }
                            if (table === 'escrow_dispute_evidences') {
                                const evidenceData = data as EvidenceData;
                                const newEvidence: Evidence = {
                                    ...evidenceData,
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
                                const disputes = mockSupabaseData.disputes.filter(d => {
                                    return d[field as keyof Dispute] === value;
                                });
                                return Promise.resolve({ data: disputes });
                            }
                            if (table === 'escrow_dispute_evidences') {
                                const evidence = mockSupabaseData.evidence.filter(e => {
                                    return e[field as keyof Evidence] === value;
                                });
                                return Promise.resolve({ data: evidence });
                            }
                            return Promise.resolve({ data: [] });
                        },
                        single: () => {
                            if (table === 'escrow_disputes') {
                                const dispute = mockSupabaseData.disputes.find(d => {
                                    return d[field as keyof Dispute] === value;
                                });
                                return Promise.resolve({ data: dispute });
                            }
                            return Promise.resolve({ data: null });
                        }
                    })
                }),
                update: (data: Partial<DisputeData> | Partial<EvidenceData>) => ({
                    eq: (field: string, value: string) => {
                        if (table === 'escrow_disputes') {
                            const index = mockSupabaseData.disputes.findIndex(d => {
                                return d[field as keyof Dispute] === value;
                            });
                            if (index !== -1) {
                                const updateData = data as Partial<DisputeData>;
                                mockSupabaseData.disputes[index] = {
                                    ...mockSupabaseData.disputes[index],
                                    ...updateData,
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
