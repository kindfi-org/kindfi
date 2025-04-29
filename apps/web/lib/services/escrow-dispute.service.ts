import { createEscrowRequest } from '~/lib/stellar/utils/create-escrow'
import type {
    StartDisputePayload,
    ResolveDisputePayload
} from '~/lib/types/escrow/escrow-payload.types'
import type { EscrowRequestResponse } from '~/lib/types/escrow/escrow-response.types'
import { createClient } from '~/lib/supabase/client'
import type {
    AddEvidencePayload,
    AssignMediatorPayload,
    CreateDisputePayload,
    Dispute,
    DisputeEvidence,
    DisputeStatus
} from '~/lib/types/escrow/dispute.types'

/**
 * Starts a dispute for an existing escrow
 * @param disputeData The data needed to start a dispute
 * @returns The response from the Trustless Work API
 */
export async function startDispute(
    disputeData: StartDisputePayload
): Promise<EscrowRequestResponse> {
    // Call the Trustless Work API to start the dispute
    const response = await createEscrowRequest({
        action: 'dispute',
        method: 'POST',
        data: disputeData
    })

    if (!response.unsignedTransaction) {
        throw new Error('Failed to start dispute')
    }

    return response
}

/**
 * Creates a new dispute record in the database
 * @param data The dispute data
 * @returns The created dispute record
 */
export async function createDisputeRecord(
    data: CreateDisputePayload
): Promise<Dispute> {
    // First, create the dispute record
    const supabase = createClient()
    const { data: row, error } = await supabase
        .from('escrow_disputes')
        .insert({
            escrow_id: data.escrowId,
            status: 'pending',
            reason: data.reason,
            initiator: data.initiator,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to create dispute record: ${error.message}`)
    }

    const dispute = row && {
        id: row.id,
        escrowId: row.escrow_id,
        status: row.status as DisputeStatus,
        reason: row.reason,
        initiator: row.initiator,
        mediator: row.mediator,
        resolution: row.resolution,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        resolvedAt: row.resolved_at,
    }

    // If there are evidence URLs, add them
    if (data.evidenceUrls && data.evidenceUrls.length > 0) {
        const evidences = data.evidenceUrls.map(url => ({
            escrow_dispute_id: dispute.id,
            evidence_url: url,
            description: 'Initial evidence',
            submitted_by: data.initiator,
            created_at: new Date().toISOString()
        }))

        const { error: evidenceError } = await supabase
            .from('escrow_dispute_evidences')
            .insert(evidences)

        if (evidenceError) {
            console.error('Failed to add evidence:', evidenceError)
        }
    }

    return dispute
}

/**
 * Updates the dispute status in the database
 * @param disputeId The ID of the dispute
 * @param status The new status of the dispute
 * @returns The updated dispute record
 */
export async function updateDisputeStatus(
    disputeId: string,
    status: DisputeStatus
): Promise<Dispute> {
    const supabase = createClient()
    const { data: row, error } = await supabase
        .from('escrow_disputes')
        .update({ 
            status,
            updated_at: new Date().toISOString(),
            ...(status === 'resolved' ? { resolved_at: new Date().toISOString() } : {})
        })
        .eq('id', disputeId)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to update dispute status: ${error.message}`)
    }

    const dispute = row && {
        id: row.id,
        escrowId: row.escrow_id,
        status: row.status as DisputeStatus,
        reason: row.reason,
        initiator: row.initiator,
        mediator: row.mediator,
        resolution: row.resolution,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        resolvedAt: row.resolved_at,
    }

    return dispute
}

/**
 * Assigns a mediator to a dispute
 * @param data The mediator assignment data
 * @returns The updated dispute record
 */
export async function assignMediator(
    data: AssignMediatorPayload
): Promise<Dispute> {
    const supabase = createClient()
    const { data: dispute, error } = await supabase
        .from('escrow_disputes')
        .update({ 
            mediator: data.mediatorAddress,
            status: 'in_review',
            updated_at: new Date().toISOString()
        })
        .eq('id', data.disputeId)
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to assign mediator: ${error.message}`)
    }

    return dispute
}

/**
 * Adds evidence to a dispute
 * @param data The evidence data
 * @returns The created evidence record
 */
export async function addEvidence(
    data: AddEvidencePayload
): Promise<DisputeEvidence> {
    const supabase = createClient()
    const { data: row, error } = await supabase
        .from('escrow_dispute_evidences')
        .insert({
            escrow_dispute_id: data.disputeId,
            evidence_url: data.evidenceUrl,
            description: data.description,
            submitted_by: data.submittedBy,
            created_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        throw new Error(`Failed to add evidence: ${error.message}`)
    }

    const evidence = row && {
        id: row.id,
        escrowDisputeId: row.escrow_dispute_id,
        evidenceUrl: row.evidence_url,
        description: row.description,
        submittedBy: row.submitted_by,
        createdAt: row.created_at
    }

    return evidence
}

/**
 * Gets a dispute by ID
 * @param disputeId The ID of the dispute
 * @returns The dispute record with evidences
 */
export async function getDisputeById(disputeId: string): Promise<Dispute> {
    // Get the dispute
    const supabase = createClient()
    const { data: dispute, error } = await supabase
        .from('escrow_disputes')
        .select('*')
        .eq('id', disputeId)
        .single()

    if (error) {
        throw new Error(`Failed to get dispute: ${error.message}`)
    }

    // Get the evidences
    const { data: evidences, error: evidencesError } = await supabase
        .from('escrow_dispute_evidences')
        .select('*')
        .eq('escrow_dispute_id', disputeId)

    if (evidencesError) {
        console.error('Failed to get evidences:', evidencesError)
    }

    return {
        ...dispute,
        evidences: evidences || []
    }
}

/**
 * Gets disputes by escrow ID
 * @param escrowId The ID of the escrow
 * @returns The dispute records
 */
/**
 * Gets disputes by escrow ID with their associated evidence
 * @param escrowId The ID of the escrow
 * @returns The dispute records with their evidence data
 */
export async function getDisputesByEscrowId(escrowId: string): Promise<Dispute[]> {
    const supabase = createClient()
    
    // Get all disputes for this escrow
    const { data: rows, error } = await supabase
        .from('escrow_disputes')
        .select('*')
        .eq('escrow_id', escrowId)

    if (error) {
        throw new Error(`Failed to get disputes: ${error.message}`)
    }

    if (!rows || rows.length === 0) {
        return []
    }

    // Get all dispute IDs to fetch evidence in a single query
    const disputeIds = rows.map(row => row.id)
    
    // Fetch all evidence for these disputes in a single query
    const { data: evidenceRows, error: evidencesError } = await supabase
        .from('escrow_dispute_evidences')
        .select('*')
        .in('escrow_dispute_id', disputeIds)

    if (evidencesError) {
        console.error('Failed to get evidences:', evidencesError)
    }

    // Group evidence by dispute ID for efficient lookup
    const evidenceByDisputeId: Record<string, DisputeEvidence[]> = {}
    if (evidenceRows) {
        evidenceRows.forEach(row => {
            const disputeId = row.escrow_dispute_id
            if (!evidenceByDisputeId[disputeId]) {
                evidenceByDisputeId[disputeId] = []
            }
            
            // Map snake_case to camelCase for each evidence item
            evidenceByDisputeId[disputeId].push({
                id: row.id,
                escrowDisputeId: row.escrow_dispute_id,
                evidenceUrl: row.evidence_url,
                description: row.description,
                submittedBy: row.submitted_by,
                createdAt: row.created_at
            })
        })
    }

    // Map each dispute row to the proper camelCase format and include its evidence
    return rows.map(row => ({
        id: row.id,
        escrowId: row.escrow_id,
        status: row.status as DisputeStatus,
        reason: row.reason,
        initiator: row.initiator,
        mediator: row.mediator,
        resolution: row.resolution,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        resolvedAt: row.resolved_at,
        evidences: evidenceByDisputeId[row.id] || []
    }))
}

/**
 * Gets evidence by dispute ID
 * @param disputeId The ID of the dispute
 * @returns The evidence records
 */
 export async function getEvidenceByDisputeId(disputeId: string): Promise<DisputeEvidence[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('escrow_dispute_evidences')
        .select('*')
        .eq('escrow_dispute_id', disputeId)

    if (error) {
        throw new Error(`Failed to get evidence: ${error.message}`)
    }

    return data || []
}

/**
 * Resolves a dispute
 * @param resolveData The data needed to resolve a dispute
 * @returns The response from the Trustless Work API
 */
export async function resolveDispute(
    resolveData: ResolveDisputePayload
): Promise<EscrowRequestResponse> {
    // Call the Trustless Work API to resolve the dispute
    const response = await createEscrowRequest({
        action: 'resolve',
        method: 'POST',
        data: resolveData
    })

    if (!response.unsignedTransaction) {
        throw new Error('Failed to resolve dispute')
    }

    return response
}
