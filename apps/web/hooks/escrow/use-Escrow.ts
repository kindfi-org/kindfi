'use client'
import { useState, useCallback } from 'react'
import type { Database } from '@services/supabase/database.types'
import {
 updateEscrowStatusAction,
 updateEscrowMilestoneAction,
 updateEscrowFinancialsAction,
 getEscrowRecordsAction
} from '~/app/actions'

type Tables = Database['public']['Tables']
type EscrowRecord = Tables['escrow_status']['Row']
type EscrowStatusType = 'NEW' | 'FUNDED' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'

interface EscrowResponse {
  success: boolean
  data?: EscrowRecord | null
  error?: string | null  
}

export const useEscrow = (escrowId: string) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [escrowData, setEscrowData] = useState<EscrowRecord | null>(null)

  const handleError = useCallback((err: unknown): string => {
    return err instanceof Error ? err.message : 'An error occurred'
  }, [])

  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<EscrowResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await operation()
      return { success: true, data: result as EscrowRecord }
    } catch (err) {
      const errorMessage = handleError(err)
      setError(errorMessage)
      return { success: false, error: errorMessage }  
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  const fetchEscrowStatus = useCallback(async () => {
    return withErrorHandling(async () => {
      const { success, data, error: responseError } = await getEscrowRecordsAction()
      if (!success) {
        throw new Error(responseError || 'Failed to fetch escrow status')
      }
      const records = data as EscrowRecord[]
      const currentRecord = records.find(record => record.id === escrowId)
      setEscrowData(currentRecord || null)
      return currentRecord
    })
  }, [escrowId, withErrorHandling])

  const updateStatus = useCallback(async (newStatus: EscrowStatusType): Promise<EscrowResponse> => {
    return withErrorHandling(async () => {
      const { success, data, error: responseError } = await updateEscrowStatusAction(escrowId, newStatus)
      if (!success) {
        throw new Error(responseError || 'Failed to update status')
      }
      const updatedRecord = data as EscrowRecord
      setEscrowData(updatedRecord)
      return updatedRecord
    })
  }, [escrowId, withErrorHandling])

  const updateMilestone = useCallback(async (current: number, completed: number): Promise<EscrowResponse> => {
    return withErrorHandling(async () => {
      const { success, data, error: responseError } = await updateEscrowMilestoneAction(escrowId, current, completed)
      if (!success) {
        throw new Error(responseError || 'Failed to update milestone')
      }
      const updatedRecord = data as EscrowRecord
      setEscrowData(updatedRecord)
      return updatedRecord
    })
  }, [escrowId, withErrorHandling])

  const updateFinancials = useCallback(async (funded: number, released: number): Promise<EscrowResponse> => {
    return withErrorHandling(async () => {
      const { success, data, error: responseError } = await updateEscrowFinancialsAction(escrowId, funded, released)
      if (!success) {
        throw new Error(responseError || 'Failed to update financials')
      }
      const updatedRecord = data as EscrowRecord
      setEscrowData(updatedRecord)
      return updatedRecord
    })
  }, [escrowId, withErrorHandling])

  return {
    escrowData,
    isLoading,
    error,
    fetchEscrowStatus,
    updateStatus,
    updateMilestone,
    updateFinancials
  }
}