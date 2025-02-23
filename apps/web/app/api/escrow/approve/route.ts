import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { KindFiDB } from '@services/supabase'

async function validateSignatures(
  signatures: string[],
  escrowId: string
): Promise<boolean> {
  // TODO: Implement passkey attestation and signature verification with the Auth Contract.
  // For example, create a contract client to call the verification method and return a boolean.
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { escrowId, signatures } = await request.json()

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables for Supabase')
    }

    // Initialize Supabase client (server-side)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Fetch existing contract using the workspace package type
    const { data: escrowContract, error: contractError } = await supabase
      .from<KindFiDB.Tables<'escrow_contracts'>['Row']>('escrow_contracts')
      .select('*')
      .eq('id', escrowId)
      .single()

    if (contractError || !escrowContract) {
      return NextResponse.json(
        { error: 'Escrow contract not found' },
        { status: 404 }
      )
    }

    // Validate signatures & check quorum
    if (!signatures || signatures.length < 2) {
      return NextResponse.json(
        { error: 'Insufficient approvals' },
        { status: 400 }
      )
    }

    // Validate signatures with our Auth Contract (passkey attestation)
    const signaturesValid = await validateSignatures(signatures, escrowId)
    if (!signaturesValid) {
      return NextResponse.json(
        { error: 'Invalid signature(s)' },
        { status: 400 }
      )
    }

    // Determine the new state using the workspace enum type
    const newState: KindFiDB.Enums<'escrow_status_type'> = 'COMPLETED'

    // Update escrow_contracts with the new state
    const { error: updateError } = await supabase
      .from<KindFiDB.Tables<'escrow_contracts'>['Update']>('escrow_contracts')
      .update({ current_state: newState })
      .eq('id', escrowId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update escrow state' },
        { status: 500 }
      )
    }

    // Insert an escrow_status record for historical tracking using the new table type
    const { error: statusError } = await supabase
      .from<KindFiDB.Tables<'escrow_status'>['Insert']>('escrow_status')
      .insert({
        escrow_id: escrowId,
        status: newState,
      })

    if (statusError) {
      return NextResponse.json(
        { error: 'Failed to record escrow status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Escrow approved', newState })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unexpected server error' },
      { status: 500 }
    )
  }
}