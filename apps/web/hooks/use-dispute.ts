'use client';

import { useState, useEffect } from 'react';
import type { Dispute } from '~/lib/types/escrow/dispute.types';

/**
 * Custom hook to fetch dispute details by ID
 * @param disputeId - The ID of the dispute to fetch
 * @returns Object containing dispute data, loading state, and error state
 */
export function useDispute(disputeId: string) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDispute = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/escrow/dispute/${disputeId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch dispute details');
        }
        
        setDispute(data.dispute);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDispute();
  }, [disputeId]);

  return { dispute, loading, error };
}
