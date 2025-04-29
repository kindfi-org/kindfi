import { describe, expect, it, mock } from 'bun:test';
import { NextRequest } from 'next/server';
import type { DisputeStatus } from '~/lib/types/escrow/dispute.types';

// Create a constant object with the dispute status values
const DISPUTE_STATUS = {
    PENDING: 'pending' as const,
    IN_REVIEW: 'in_review' as const,
    RESOLVED: 'resolved' as const,
    REJECTED: 'rejected' as const
};

// Mock the dispute service
const createDisputeRecordMock = mock(() => Promise.resolve({ 
    id: 'test-id',
    escrowId: 'escrow-id',
    status: DISPUTE_STATUS.PENDING,
    reason: 'Test reason',
    initiator: 'user123',
    createdAt: { seconds: 1619712000, nanoseconds: 0 },
    updatedAt: { seconds: 1619712000, nanoseconds: 0 }
}));

const getDisputesByEscrowIdMock = mock(() => Promise.resolve([{ 
    id: 'test-id',
    escrowId: 'escrow-id',
    status: DISPUTE_STATUS.PENDING,
    reason: 'Test reason',
    initiator: 'user123',
    createdAt: { seconds: 1619712000, nanoseconds: 0 },
    updatedAt: { seconds: 1619712000, nanoseconds: 0 }
}]));

const getDisputeByIdMock = mock(() => Promise.resolve({ 
    id: 'test-id',
    escrowId: 'escrow-id',
    status: DISPUTE_STATUS.PENDING,
    reason: 'Test reason',
    initiator: 'user123',
    createdAt: { seconds: 1619712000, nanoseconds: 0 },
    updatedAt: { seconds: 1619712000, nanoseconds: 0 }
}));

const updateDisputeStatusMock = mock(() => Promise.resolve({ 
    id: 'test-id',
    escrowId: 'escrow-id',
    status: DISPUTE_STATUS.IN_REVIEW,
    reason: 'Test reason',
    initiator: 'user123',
    createdAt: { seconds: 1619712000, nanoseconds: 0 },
    updatedAt: { seconds: 1619712000, nanoseconds: 0 }
}));

const deleteDisputeMock = mock(() => Promise.resolve({ success: true }));

const resolveDisputeMock = mock(() => Promise.resolve({
    unsignedTransaction: 'mock-transaction',
    status: 'success'
}));

const addEvidenceMock = mock(() => Promise.resolve({ 
    id: 'evidence-id',
    disputeId: 'test-id',
    evidenceUrl: 'https://example.com/evidence',
    description: 'Test evidence',
    submittedBy: 'user123',
    createdAt: { seconds: 1619712000, nanoseconds: 0 }
}));

const getDisputeEvidenceMock = mock(() => Promise.resolve([{
    id: 'evidence-id',
    disputeId: 'test-id',
    evidenceUrl: 'https://example.com/evidence',
    description: 'Test evidence',
    submittedBy: 'user123',
    createdAt: { seconds: 1619712000, nanoseconds: 0 }
}]));

// Mock the dispute service
mock.module('~/lib/services/escrow-dispute.service', () => ({
    createDisputeRecord: createDisputeRecordMock,
    getDisputesByEscrowId: getDisputesByEscrowIdMock,
    getDisputeById: getDisputeByIdMock,
    updateDisputeStatus: updateDisputeStatusMock,
    deleteDispute: deleteDisputeMock,
    resolveDispute: resolveDisputeMock,
    addEvidence: addEvidenceMock,
    getDisputeEvidence: getDisputeEvidenceMock
}));

describe('Escrow Dispute API Routes', () => {
    describe('POST /api/escrow/dispute', () => {
        it('should create a dispute', async () => {
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
            
            expect(createDisputeRecordMock).toHaveBeenCalled();
            expect(data.dispute).toBeDefined();
            expect(data.dispute.id).toBe('test-id');
        });
    });
    
    describe('GET /api/escrow/dispute', () => {
        it('should get disputes for an escrow', async () => {
            // Import the route handler
            const { GET } = await import('~/app/api/escrow/dispute/route');
            
            const url = new URL('http://localhost:3000/api/escrow/dispute');
            url.searchParams.append('escrowId', 'escrow-id');
            const req = new NextRequest(url);
            
            const res = await GET(req);
            const data = await res.json();
            
            expect(getDisputesByEscrowIdMock).toHaveBeenCalledWith('escrow-id');
            expect(data.disputes).toBeDefined();
            expect(data.disputes.length).toBe(1);
            expect(data.disputes[0].id).toBe('test-id');
        });
    });
    
    describe('GET /api/escrow/dispute/[id]', () => {
        it('should get a dispute by ID', async () => {
            // Import the route handler
            const { GET } = await import('~/app/api/escrow/dispute/[id]/route');
            
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id');
            
            const res = await GET(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(getDisputeByIdMock).toHaveBeenCalledWith('test-id');
            expect(data.dispute).toBeDefined();
            expect(data.dispute.id).toBe('test-id');
        });
    });
    
    describe('PATCH /api/escrow/dispute/[id]', () => {
        it('should update a dispute', async () => {
            // Import the route handler
            const { PATCH } = await import('~/app/api/escrow/dispute/[id]/route');
            
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id', {
                method: 'PATCH',
                body: JSON.stringify({
                    escrowId: 'test-id',
                    status: 'in_review'
                })
            });
            
            const res = await PATCH(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(updateDisputeStatusMock).toHaveBeenCalled();
            expect(data.dispute).toBeDefined();
            expect(data.dispute.id).toBe('test-id');
            expect(data.dispute.status).toBe(DISPUTE_STATUS.IN_REVIEW);
        });
    });
    
    describe('DELETE /api/escrow/dispute/[id]', () => {
        it('should delete a dispute', async () => {
            // Import the route handler
            const { DELETE } = await import('~/app/api/escrow/dispute/[id]/route');
            
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id', {
                method: 'DELETE'
            });
            
            const res = await DELETE(req, { params: { id: 'test-id' } });
            
            expect(deleteDisputeMock).toHaveBeenCalled();
            expect(res.status).toBe(204);
        });
    });
    
    describe('POST /api/escrow/dispute/[id]/resolve', () => {
        it('should resolve a dispute', async () => {
            // Import the route handler
            const { POST } = await import('~/app/api/escrow/dispute/[id]/resolve/route');
            
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id/resolve', {
                method: 'POST',
                body: JSON.stringify({
                    contractId: '0x123abc',
                    disputeResolver: 'resolver123',
                    approverFunds: '50',
                    serviceProviderFunds: '50',
                    resolution: 'Both parties agreed to split the funds'
                })
            });
            
            const res = await POST(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(resolveDisputeMock).toHaveBeenCalled();
            expect(data.success).toBe(true);
        });
    });
    
    describe('POST /api/escrow/dispute/[id]/evidence', () => {
        it('should add evidence to a dispute', async () => {
            // Import the route handler
            const { POST } = await import('~/app/api/escrow/dispute/[id]/evidence/route');
            
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id/evidence', {
                method: 'POST',
                body: JSON.stringify({
                    evidenceUrl: 'https://example.com/evidence',
                    description: 'Screenshot of conversation',
                    submittedBy: 'user123'
                })
            });
            
            const res = await POST(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(addEvidenceMock).toHaveBeenCalled();
            expect(data.evidence).toBeDefined();
            expect(data.evidence.id).toBe('evidence-id');
        });
    });
    
    describe('GET /api/escrow/dispute/[id]/evidence', () => {
        it('should get evidence for a dispute', async () => {
            // Import the route handler
            const { GET } = await import('~/app/api/escrow/dispute/[id]/evidence/route');
            
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id/evidence');
            
            const res = await GET(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(getDisputeEvidenceMock).toHaveBeenCalledWith('test-id');
            expect(data.evidence).toBeDefined();
            expect(data.evidence.length).toBe(1);
            expect(data.evidence[0].id).toBe('evidence-id');
        });
    });
});
