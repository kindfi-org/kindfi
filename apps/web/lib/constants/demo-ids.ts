/**
 * Demo IDs for development and testing purposes only.
 * These should never be used in production code.
 */

// Only export the demo IDs in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Demo escrow IDs
export const demoEscrowIds = isDevelopment ? {
    escrow1: '123e4567-e89b-12d3-a456-426614174000',
    escrow2: '223e4567-e89b-12d3-a456-426614174001',
    escrow3: '323e4567-e89b-12d3-a456-426614174002',
    defaultEscrow: '123e4567-e89b-12d3-a456-426614174000'
} : {
    escrow1: '',
    escrow2: '',
    escrow3: '',
    defaultEscrow: ''
};

// Demo dispute IDs
export const demoDisputeIds = isDevelopment ? {
    dispute1: '123e4567-e89b-12d3-a456-426614174010',
    dispute2: '223e4567-e89b-12d3-a456-426614174011',
    dispute3: '323e4567-e89b-12d3-a456-426614174012',
} : {
    dispute1: '',
    dispute2: '',
    dispute3: '',
};
