import { describe, expect, it, mock, spyOn, beforeEach } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DisputeForm, DisputeList, DisputeDetails } from '~/components/escrow/dispute';
import * as disputeService from '~/lib/services/escrow-dispute.service';

// Create success and error mock implementations
const successMocks = {
    createDispute: mock(() => Promise.resolve({ id: 'test-id' })),
    getDisputesByEscrowId: mock(() => Promise.resolve([
        { 
            id: 'test-id',
            escrowId: '0x123abc',
            reason: 'Service not delivered',
            status: 'pending',
            createdAt: { seconds: 1619712000, nanoseconds: 0 },
            initiator: 'user123'
        }
    ])),
    getDisputeById: mock(() => Promise.resolve({ 
        id: 'test-id',
        escrowId: '0x123abc',
        reason: 'Service not delivered',
        status: 'pending',
        createdAt: { seconds: 1619712000, nanoseconds: 0 },
        initiator: 'user123'
    })),
    getEvidenceByDisputeId: mock(() => Promise.resolve([
        {
            id: 'evidence-id',
            escrowDisputeId: 'test-id',
            evidenceUrl: 'https://example.com/evidence',
            description: 'Screenshot of conversation',
            submittedBy: 'user123',
            createdAt: { seconds: 1619712000, nanoseconds: 0 }
        }
    ])),
    addEvidence: mock(() => Promise.resolve({ id: 'evidence-id' })),
    resolveDispute: mock(() => Promise.resolve({ id: 'test-id', status: 'resolved' }))
};

const errorMocks = {
    getDisputeById: mock(() => Promise.reject(new Error('Failed to fetch dispute'))),
    getDisputesByEscrowId: mock(() => Promise.reject(new Error('Failed to fetch disputes'))),
    getEvidenceByDisputeId: mock(() => Promise.reject(new Error('Failed to fetch evidence'))),
    addEvidence: mock(() => Promise.reject(new Error('Failed to add evidence'))),
    resolveDispute: mock(() => Promise.reject(new Error('Failed to resolve dispute')))
};

// Store original mocks for restoring later
const originalMocks = { ...successMocks };

// Create a utility to switch between success and error mocks
const mockUtils = {
    setMockToFail: (methodName: keyof typeof successMocks, shouldFail = true) => {
        // @ts-ignore - Dynamic property access
        disputeService[methodName] = shouldFail ? errorMocks[methodName] : originalMocks[methodName];
    },
    resetAllMocks: () => {
        Object.keys(originalMocks).forEach(key => {
            // @ts-ignore - Dynamic property access
            disputeService[key] = originalMocks[key];
        });
    }
};

// Mock the dispute service with success implementations by default
mock.module('~/lib/services/escrow-dispute.service', () => ({
    ...successMocks,
    // Expose mock utilities for tests
    __mockUtils: mockUtils
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
        // Reset mocks before each test
        beforeEach(() => {
            // @ts-ignore - Access to internal mock utilities
            disputeService.__mockUtils.resetAllMocks();
        });

        it('should render the details correctly', async () => {
            const onResolve = mock(() => {});
            const onAddEvidence = mock(() => {});
            const getDisputeByIdSpy = spyOn(disputeService, 'getDisputeById');
            const getEvidenceByDisputeIdSpy = spyOn(disputeService, 'getEvidenceByDisputeId');
            
            render(
                <DisputeDetails
                    disputeId="test-id"
                    onResolve={onResolve}
                    onAddEvidence={onAddEvidence}
                />
            );
            
            await waitFor(() => {
                expect(getDisputeByIdSpy).toHaveBeenCalledWith('test-id');
                expect(getEvidenceByDisputeIdSpy).toHaveBeenCalledWith('test-id');
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

        it('should call onResolve when resolve button is clicked', async () => {
            const onResolve = mock(() => {});
            const onAddEvidence = mock(() => {});
            
            // Mock a dispute in review status with a mediator
            spyOn(disputeService, 'getDisputeById').mockImplementation(() => Promise.resolve({
                id: 'test-id',
                escrowId: '0x123abc',
                reason: 'Service not delivered',
                status: 'in_review',
                mediator: 'mediator123',
                initiator: 'user123',
                createdAt: { seconds: 1619712000, nanoseconds: 0 },
                updatedAt: { seconds: 1619712000, nanoseconds: 0 }
            }));
            
            render(
                <DisputeDetails
                    disputeId="test-id"
                    onResolve={onResolve}
                    onAddEvidence={onAddEvidence}
                />
            );
            
            await waitFor(() => {
                const resolveButton = screen.getByRole('button', { name: /Resolve Dispute/i });
                expect(resolveButton).toBeInTheDocument();
                fireEvent.click(resolveButton);
                expect(onResolve).toHaveBeenCalled();
            });
        });

        it('should handle API errors gracefully', async () => {
            const onResolve = mock(() => {});
            const onAddEvidence = mock(() => {});
            
            // Set the mock to fail with an error
            // @ts-ignore - Access to internal mock utilities
            disputeService.__mockUtils.setMockToFail('getDisputeById');
            
            render(
                <DisputeDetails
                    disputeId="test-id"
                    onResolve={onResolve}
                    onAddEvidence={onAddEvidence}
                />
            );
            
            await waitFor(() => {
                // Should display an error message
                expect(screen.getByText(/error/i)).toBeInTheDocument();
                expect(screen.getByText(/failed to fetch dispute/i)).toBeInTheDocument();
            });
        });
    });
});
