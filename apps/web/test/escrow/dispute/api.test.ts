import { describe, expect, it, mock, spyOn } from 'bun:test';
import { NextRequest, NextResponse } from 'next/server';
import * as disputeService from '~/lib/services/escrow-dispute.service';
import { POST as createDispute, GET as getDisputes } from '~/app/api/escrow/dispute/route';
import { GET as getDisputeById, PATCH as updateDispute, DELETE as deleteDispute } from '~/app/api/escrow/dispute/[id]/route';
import { POST as resolveDispute } from '~/app/api/escrow/dispute/[id]/resolve/route';
import { POST as addEvidence, GET as getEvidence } from '~/app/api/escrow/dispute/[id]/evidence/route';

// Mock the dispute service
mock.module('~/lib/services/escrow-dispute.service', () => ({
    createDisputeRecord: mock(() => Promise.resolve({ 
        id: 'test-id',
        escrowId: 'escrow-id',
        status: 'pending',
        reason: 'Test reason',
        initiator: 'user123',
        createdAt: { seconds: 1619712000, nanoseconds: 0 },
        updatedAt: { seconds: 1619712000, nanoseconds: 0 }
    })),
    getDisputesByEscrowId: mock(() => Promise.resolve([{ 
        id: 'test-id',
        escrowId: 'escrow-id',
        status: 'pending',
        reason: 'Test reason',
        initiator: 'user123',
        createdAt: { seconds: 1619712000, nanoseconds: 0 },
        updatedAt: { seconds: 1619712000, nanoseconds: 0 }
    }])),
    getDisputeById: mock(() => Promise.resolve({ 
        id: 'test-id',
        escrowId: 'escrow-id',
        status: 'pending',
        reason: 'Test reason',
        initiator: 'user123',
        createdAt: { seconds: 1619712000, nanoseconds: 0 },
        updatedAt: { seconds: 1619712000, nanoseconds: 0 }
    })),
    updateDisputeStatus: mock(() => Promise.resolve({ 
        id: 'test-id',
        escrowId: 'escrow-id',
        status: 'in_review',
        reason: 'Test reason',
        initiator: 'user123',
        createdAt: { seconds: 1619712000, nanoseconds: 0 },
        updatedAt: { seconds: 1619712000, nanoseconds: 0 }
    })),
    // Note: deleteDispute is not in the service, we'll need to handle this differently
    resolveDispute: mock(() => Promise.resolve({ 
        unsignedTransaction: 'mock-transaction',
        status: 'success'
    })),
    addEvidence: mock(() => Promise.resolve({ 
        id: 'evidence-id',
        disputeId: 'test-id',
        evidenceUrl: 'https://example.com/evidence',
        description: 'Test evidence',
        submittedBy: 'user123',
        createdAt: { seconds: 1619712000, nanoseconds: 0 }
    })),
    // Note: getDisputeEvidence is not directly exposed, evidence comes with getDisputeById
    assignMediator: mock(() => Promise.resolve({ 
        id: 'test-id',
        escrowId: 'escrow-id',
        status: 'in_review',
        reason: 'Test reason',
        initiator: 'user123',
        mediatorAddress: '0xabc123',
        createdAt: { seconds: 1619712000, nanoseconds: 0 },
        updatedAt: { seconds: 1619712000, nanoseconds: 0 }
    })),
    startDispute: mock(() => Promise.resolve({
        unsignedTransaction: 'mock-transaction',
        status: 'success'
    }))
}));

describe('Escrow Dispute API Routes', () => {
    describe('POST /api/escrow/dispute', () => {
        it('should create a dispute', async () => {
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute', {
                method: 'POST',
                body: JSON.stringify({
                    contractId: '0x123abc',
                    signer: 'user123',
                    reason: 'Service not delivered as promised'
                })
            });
            
            const spy = spyOn(disputeService, 'createDisputeRecord');
            const res = await createDispute(req);
            const data = await res.json();
            
            expect(spy).toHaveBeenCalled();
            expect(data).toEqual({ dispute: { id: 'test-id' } });
            expect(res.status).toBe(201);
        });
    });
    
    describe('GET /api/escrow/dispute', () => {
        it('should get disputes for an escrow', async () => {
            const url = new URL('http://localhost:3000/api/escrow/dispute');
            url.searchParams.append('escrowId', 'escrow-id');
            const req = new NextRequest(url);
            
            const spy = spyOn(disputeService, 'getDisputesByEscrowId');
            const res = await getDisputes(req);
            const data = await res.json();
            
            expect(spy).toHaveBeenCalledWith('escrow-id');
            expect(data).toEqual({ disputes: [{ id: 'test-id' }] });
            expect(res.status).toBe(200);
        });
    });
    
    describe('GET /api/escrow/dispute/[id]', () => {
        it('should get a dispute by ID', async () => {
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id');
            
            const spy = spyOn(disputeService, 'getDisputeById');
            const res = await getDisputeById(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(spy).toHaveBeenCalledWith('test-id');
            expect(data).toEqual({ dispute: { id: 'test-id' } });
            expect(res.status).toBe(200);
        });
    });
    
    describe('PATCH /api/escrow/dispute/[id]', () => {
        it('should update a dispute', async () => {
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id', {
                method: 'PATCH',
                body: JSON.stringify({
                    escrowId: 'test-id',
                    status: 'in_review'
                })
            });
            
            const spy = spyOn(disputeService, 'updateDisputeStatus');
            const res = await updateDispute(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(spy).toHaveBeenCalled();
            expect(data).toEqual({ dispute: { id: 'test-id', status: 'in_review' } });
            expect(res.status).toBe(200);
        });
    });
    
    describe('DELETE /api/escrow/dispute/[id]', () => {
        it('should delete a dispute', async () => {
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id', {
                method: 'DELETE'
            });
            
            // Since deleteDispute doesn't exist in the service, we'll mock a custom function
const deleteDisputeMock = mock(() => Promise.resolve({ id: 'test-id' }));
mock.module('~/app/api/escrow/dispute/[id]/route', () => ({
    ...require('~/app/api/escrow/dispute/[id]/route'),
    deleteDisputeFromDb: deleteDisputeMock
}));
const spy = spyOn(mock.fn(), 'mock');
            const res = await deleteDispute(req, { params: { id: 'test-id' } });
            
            expect(spy).toHaveBeenCalledWith('test-id');
            expect(res.status).toBe(204);
        });
    });
    
    describe('POST /api/escrow/dispute/[id]/resolve', () => {
        it('should resolve a dispute', async () => {
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
            
            const spy = spyOn(disputeService, 'resolveDispute');
            const res = await resolveDispute(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(spy).toHaveBeenCalled();
            expect(data).toEqual({ dispute: { id: 'test-id', status: 'resolved' } });
            expect(res.status).toBe(200);
        });
    });
    
    describe('POST /api/escrow/dispute/[id]/evidence', () => {
        it('should add evidence to a dispute', async () => {
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id/evidence', {
                method: 'POST',
                body: JSON.stringify({
                    escrowId: 'test-id',
                    evidenceUrl: 'https://example.com/evidence',
                    description: 'Screenshot of conversation',
                    submittedBy: 'user123'
                })
            });
            
            const spy = spyOn(disputeService, 'addEvidence');
            const res = await addEvidence(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(spy).toHaveBeenCalled();
            expect(data).toEqual({ evidence: { id: 'evidence-id' } });
            expect(res.status).toBe(201);
        });
    });
    
    describe('GET /api/escrow/dispute/[id]/evidence', () => {
        it('should get evidence for a dispute', async () => {
            const req = new NextRequest('http://localhost:3000/api/escrow/dispute/test-id/evidence');
            
            const spy = spyOn(disputeService, 'getDisputeById');
            const res = await getEvidence(req, { params: { id: 'test-id' } });
            const data = await res.json();
            
            expect(spy).toHaveBeenCalledWith('test-id');
            expect(data).toEqual({ evidence: [{ id: 'evidence-id' }] });
            expect(res.status).toBe(200);
        });
    });
});
