import { describe, expect, it, mock, spyOn } from 'bun:test';
import * as supabaseClient from '~/lib/supabase/client';
import {
    createDisputeRecord,
    getDisputeById,
    getDisputesByEscrowId,
    updateDisputeStatus,
    addEvidence,
    startDispute,
    resolveDispute,
    assignMediator
} from '~/lib/services/escrow-dispute.service';
import { DisputeStatus, Dispute, DisputeEvidence } from '~/lib/types/escrow/dispute.types';
import { EscrowRequestResponse } from '~/lib/types/escrow/escrow-response.types';

// Mock the Supabase client
const mockSupabase = {
    from: () => ({
        insert: () => ({
            select: () => ({
                single: () => Promise.resolve({ 
                    data: { 
                        id: 'test-id',
                        escrowId: 'escrow-id',
                        status: 'pending',
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
                        status: 'pending',
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
                        status: 'pending',
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
                    status: 'in_review',
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

// Mock the startDispute function
mock.module('~/lib/stellar/utils/create-escrow', () => ({
    createEscrowRequest: () => Promise.resolve({
        unsignedTransaction: 'mock-transaction',
        status: 'success'
    })
}));

describe('Escrow Dispute Service', () => {
    describe('createDisputeRecord', () => {
        it('should create a dispute and return the created dispute', async () => {
            const spy = spyOn(mockSupabase, 'from');
            
            const dispute = await createDisputeRecord({
                contractId: '0x123abc',
                reason: 'Service not delivered as promised',
                createdBy: 'user123',
                evidenceUrls: ['https://example.com/evidence1']
            }) as Dispute;
            
            expect(spy).toHaveBeenCalledWith('escrow_disputes');
            expect(dispute.id).toEqual('test-id');
        });
    });
    
    describe('getDisputeById', () => {
        it('should return a dispute by ID', async () => {
            const spy = spyOn(mockSupabase, 'from');
            
            const dispute = await getDisputeById('test-id') as Dispute;
            
            expect(spy).toHaveBeenCalledWith('escrow_disputes');
            expect(dispute.id).toEqual('test-id');
        });
    });
    
    describe('getDisputesByEscrowId', () => {
        it('should return disputes for an escrow ID', async () => {
            const spy = spyOn(mockSupabase, 'from');
            
            const disputes = await getDisputesByEscrowId('escrow-id') as Dispute[];
            
            expect(spy).toHaveBeenCalledWith('escrow_disputes');
            expect(disputes[0].id).toEqual('test-id');
        });
    });
    
    describe('updateDisputeStatus', () => {
        it('should update a dispute status', async () => {
            const spy = spyOn(mockSupabase, 'from');
            
            const result = await updateDisputeStatus(
                'test-id',
                'in_review'
            ) as Dispute;
            
            expect(spy).toHaveBeenCalledWith('escrow_disputes');
            expect(result.id).toEqual('test-id');
            expect(result.status).toEqual('in_review');
        });
    });
    
    describe('addEvidence', () => {
        it('should add evidence to a dispute', async () => {
            const spy = spyOn(mockSupabase, 'from');
            
            const evidence = await addEvidence({
                disputeId: 'test-id',
                evidenceUrl: 'https://example.com/evidence',
                description: 'Screenshot of conversation',
                submittedBy: 'user123'
            }) as DisputeEvidence;
            
            expect(spy).toHaveBeenCalledWith('escrow_dispute_evidences');
            expect(evidence.id).toEqual('evidence-id');
        });
    });
    
    describe('getDisputeById with evidence', () => {
        it('should get evidence for a dispute', async () => {
            const spy = spyOn(mockSupabase, 'from');
            
            const dispute = await getDisputeById('test-id') as Dispute;
            
            expect(spy).toHaveBeenCalledWith('escrow_disputes');
            expect(dispute.id).toEqual('test-id');
        });
    });
    
    describe('resolveDispute', () => {
        it('should resolve a dispute', async () => {
            const spy = spyOn(mockSupabase, 'from');
            
            const result = await resolveDispute({
                contractId: '0x123abc',
                disputeResolver: 'resolver123',
                approverFunds: '50',
                serviceProviderFunds: '50'
            });
            
            expect(spy).toHaveBeenCalledWith('escrow_disputes');
            expect(result.id).toEqual('test-id');
            expect(result.status).toEqual('in_review');
        });
    });
    
    describe('assignMediator', () => {
        it('should assign a mediator to a dispute', async () => {
            const spy = spyOn(mockSupabase, 'from');
            
            const result = await assignMediator({
                disputeId: 'test-id',
                mediatorAddress: '0xabc123'
            }) as Dispute;
            
            expect(spy).toHaveBeenCalledWith('escrow_disputes');
            expect(result.id).toEqual('test-id');
            expect(result.status).toEqual('in_review');
        });
    });
});
