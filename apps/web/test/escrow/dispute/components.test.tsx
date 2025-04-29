import { describe, expect, it, mock, spyOn } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DisputeForm } from '~/components/escrow/dispute';
import { DisputeList } from '~/components/escrow/dispute';
import { DisputeDetails } from '~/components/escrow/dispute';
import * as disputeService from '~/lib/services/escrow-dispute.service';

// Mock the dispute service
mock.module('~/lib/services/escrow-dispute.service', () => ({
    createDispute: mock(() => Promise.resolve({ id: 'test-id' })),
    getDisputesByEscrowId: mock(() => Promise.resolve([
        { 
            id: 'test-id',
            contractId: '0x123abc',
            reason: 'Service not delivered',
            status: 'pending',
            createdAt: { seconds: 1619712000, nanoseconds: 0 },
            createdBy: 'user123'
        }
    ])),
    getDisputeById: mock(() => Promise.resolve({ 
        id: 'test-id',
        contractId: '0x123abc',
        reason: 'Service not delivered',
        status: 'pending',
        createdAt: { seconds: 1619712000, nanoseconds: 0 },
        createdBy: 'user123'
    })),
    getDisputeEvidence: mock(() => Promise.resolve([
        {
            id: 'evidence-id',
            disputeId: 'test-id',
            evidenceUrl: 'https://example.com/evidence',
            description: 'Screenshot of conversation',
            submittedBy: 'user123',
            createdAt: { seconds: 1619712000, nanoseconds: 0 }
        }
    ])),
    addDisputeEvidence: mock(() => Promise.resolve({ id: 'evidence-id' })),
    resolveDispute: mock(() => Promise.resolve({ id: 'test-id', status: 'resolved' }))
}));

// Mock next/navigation
mock.module('next/navigation', () => ({
    useRouter: () => ({
        push: mock(() => {}),
        refresh: mock(() => {}),
        back: mock(() => {})
    }),
    useSearchParams: () => ({
        get: (param: string) => param === 'escrowId' ? 'escrow-id' : null
    })
}));

describe('Escrow Dispute Components', () => {
    describe('DisputeForm', () => {
        it('should render the form correctly', () => {
            const onSuccess = mock(() => {});
            const onError = mock(() => {});
            
            render(
                <DisputeForm
                    contractId="0x123abc"
                    signer="user123"
                    onSuccess={onSuccess}
                    onError={onError}
                />
            );
            
            expect(screen.getByText('File a Dispute')).toBeInTheDocument();
            expect(screen.getByLabelText(/Reason for dispute/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
        });
        
        it('should submit the form with valid data', async () => {
            const onSuccess = mock(() => {});
            const onError = mock(() => {});
            const createDisputeSpy = spyOn(disputeService, 'createDispute');
            
            render(
                <DisputeForm
                    contractId="0x123abc"
                    signer="user123"
                    onSuccess={onSuccess}
                    onError={onError}
                />
            );
            
            fireEvent.change(screen.getByLabelText(/Reason for dispute/i), {
                target: { value: 'Service not delivered as promised' }
            });
            
            fireEvent.click(screen.getByRole('button', { name: /Submit/i }));
            
            await waitFor(() => {
                expect(createDisputeSpy).toHaveBeenCalledWith({
                    contractId: '0x123abc',
                    signer: 'user123',
                    reason: 'Service not delivered as promised'
                });
                expect(onSuccess).toHaveBeenCalledWith({ id: 'test-id' });
            });
        });
    });
    
    describe('DisputeList', () => {
        it('should render the list correctly', async () => {
            const onViewDispute = mock(() => {});
            const onCreateDispute = mock(() => {});
            const getDisputesSpy = spyOn(disputeService, 'getDisputesByEscrowId');
            
            render(
                <DisputeList
                    escrowId="escrow-id"
                    onViewDispute={onViewDispute}
                    onCreateDispute={onCreateDispute}
                />
            );
            
            await waitFor(() => {
                expect(getDisputesSpy).toHaveBeenCalledWith('escrow-id');
                expect(screen.getByText('Service not delivered')).toBeInTheDocument();
                expect(screen.getByText('pending')).toBeInTheDocument();
            });
        });
        
        it('should call onViewDispute when view button is clicked', async () => {
            const onViewDispute = mock(() => {});
            const onCreateDispute = mock(() => {});
            
            render(
                <DisputeList
                    escrowId="escrow-id"
                    onViewDispute={onViewDispute}
                    onCreateDispute={onCreateDispute}
                />
            );
            
            await waitFor(() => {
                fireEvent.click(screen.getByRole('button', { name: /View/i }));
                expect(onViewDispute).toHaveBeenCalledWith('test-id');
            });
        });
    });
    
    describe('DisputeDetails', () => {
        it('should render the details correctly', async () => {
            const onResolve = mock(() => {});
            const onAddEvidence = mock(() => {});
            const getDisputeByIdSpy = spyOn(disputeService, 'getDisputeById');
            const getDisputeEvidenceSpy = spyOn(disputeService, 'getDisputeEvidence');
            
            render(
                <DisputeDetails
                    disputeId="test-id"
                    onResolve={onResolve}
                    onAddEvidence={onAddEvidence}
                />
            );
            
            await waitFor(() => {
                expect(getDisputeByIdSpy).toHaveBeenCalledWith('test-id');
                expect(getDisputeEvidenceSpy).toHaveBeenCalledWith('test-id');
                expect(screen.getByText('Service not delivered')).toBeInTheDocument();
                expect(screen.getByText('pending')).toBeInTheDocument();
                expect(screen.getByText('Screenshot of conversation')).toBeInTheDocument();
            });
        });
        
        it('should call onAddEvidence when add evidence button is clicked', async () => {
            const onResolve = mock(() => {});
            const onAddEvidence = mock(() => {});
            
            render(
                <DisputeDetails
                    disputeId="test-id"
                    onResolve={onResolve}
                    onAddEvidence={onAddEvidence}
                />
            );
            
            await waitFor(() => {
                fireEvent.click(screen.getByRole('button', { name: /Add Evidence/i }));
                expect(onAddEvidence).toHaveBeenCalled();
            });
        });
    });
});
