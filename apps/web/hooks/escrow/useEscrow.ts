'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import type { Database } from '../../../../services/supabase/database.types'

type Tables = Database['public']['Tables']
type EscrowRecord = Tables['escrow_status']['Row']
type EscrowStatusType = 'NEW' | 'FUNDED' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'

interface EscrowStatusState {
  state: EscrowStatusType
  milestoneStatus: {
    current: number
    total: number
    completed: number
  }
  financials: {
    totalFunded: number
    totalReleased: number
    pendingRelease: number
  }
}

interface MilestoneMetadata {
  milestoneStatus: {
    total: number
    completed: number
  }
}

export function useEscrow(escrowId: string) {
  const [status, setStatus] = useState<EscrowStatusState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [rawRecord, setRawRecord] = useState<EscrowRecord | null>(null)
  const supabase = createClient()

  const transformRecord = (record: EscrowRecord): EscrowStatusState | null => {
    if (record.status === 'CANCELLED') return null

    // Safely cast metadata with type checking
    const metadata = typeof record.metadata === 'object' && record.metadata
      ? record.metadata as { milestoneStatus?: { total: number; completed: number } }
      : { milestoneStatus: { total: 0, completed: 0 } }

    return {
      state: record.status,
      milestoneStatus: {
        current: record.current_milestone || 0,
        total: metadata?.milestoneStatus?.total || 0,
        completed: metadata?.milestoneStatus?.completed || 0,
      },
      financials: {
        totalFunded: Number(record.total_funded) || 0,
        totalReleased: Number(record.total_released) || 0,
        pendingRelease:
          (Number(record.total_funded) || 0) -
          (Number(record.total_released) || 0),
      },
    }
  }

  const fetchEscrowStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('escrow_status')
        .select('*')
        .eq('escrow_id', escrowId)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setRawRecord(data as EscrowRecord)
        const transformed = transformRecord(data as EscrowRecord)
        if (transformed) setStatus(transformed)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch escrow status'),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEscrowStatus()

    const channel = supabase
      .channel(`escrow_status:${escrowId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'escrow_status',
          filter: `escrow_id=eq.${escrowId}`,
        },
        (payload) => {
          if (payload.new) {
            const newRecord = payload.new as EscrowRecord
            setRawRecord(newRecord)
            const transformed = transformRecord(newRecord)
            if (transformed) setStatus(transformed)
          }
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [escrowId])

  const updateStatus = async (newStatus: EscrowStatusType) => {
    try {
      if (!rawRecord) throw new Error('No record to update')

      const { error: updateError } = await supabase
        .from('escrow_status')
        .update({
          status: newStatus,
          last_updated: new Date().toISOString(),
        })
        .eq('id', rawRecord.id)

      if (updateError) throw updateError
      await fetchEscrowStatus()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update status')
      setError(error)
      throw error
    }
  }

  const updateMilestone = async (current: number, completed: number) => {
    try {
      if (!rawRecord) throw new Error('No record to update')

      // Safely handle existing metadata
      const existingMetadata = typeof rawRecord.metadata === 'object' && rawRecord.metadata
        ? rawRecord.metadata as { milestoneStatus?: { total: number; completed: number } }
        : { milestoneStatus: { total: 0, completed: 0 } }

      const total = existingMetadata?.milestoneStatus?.total || completed

      const updatedMetadata = {
        milestoneStatus: {
          total,
          completed
        }
      }

      const { error: updateError } = await supabase
        .from('escrow_status')
        .update({
          current_milestone: current,
          metadata: updatedMetadata,
          last_updated: new Date().toISOString()
        })
        .eq('id', rawRecord.id)

      if (updateError) throw updateError
      await fetchEscrowStatus()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update milestone')
      setError(error)
      throw error
    }
  }

  const updateFinancials = async (funded: number, released: number) => {
    try {
      if (!rawRecord) throw new Error('No record to update')
      if (funded < released) {
        throw new Error('Total funded cannot be less than total released')
      }

      const { error: updateError } = await supabase
        .from('escrow_status')
        .update({
          total_funded: funded,
          total_released: released,
          last_updated: new Date().toISOString()
        })
        .eq('id', rawRecord.id)

      if (updateError) throw updateError
      await fetchEscrowStatus()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update financials')
      setError(error)
      throw error
    }
  }

  return {
    status,
    loading,
    error,
    updateStatus,
    updateMilestone,
    updateFinancials,
    refetch: fetchEscrowStatus,
  }
}