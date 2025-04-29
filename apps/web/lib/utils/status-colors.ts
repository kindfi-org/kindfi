import type { DisputeStatus } from '~/lib/types/escrow/dispute.types';

/**
 * Get the appropriate CSS classes for a dispute status badge
 * @param status - The dispute status
 * @returns CSS class string for styling the status badge
 */
export function getDisputeStatusColor(status: DisputeStatus | string): string {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'in_review':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
