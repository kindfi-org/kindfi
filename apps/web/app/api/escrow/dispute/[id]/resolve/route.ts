import { NextRequest, NextResponse } from 'next/server'
import { resolveDispute, updateDisputeStatus } from '~/lib/services/escrow-dispute.service'
import { resolveDisputeValidator } from '~/lib/constants/escrow/dispute.validator'
import { supabase } from '~/lib/supabase/client'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await req.json()
        
        // Validate using zod
        const validationResult = resolveDisputeValidator.safeParse(body)
        
        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Invalid resolution data', 
                    details: validationResult.error.errors 
                },
                { status: 400 }
            )
        }

        const { contractId, disputeResolver, approverFunds, serviceProviderFunds, resolution } = validationResult.data
        
        // 1. Call the Trustless Work API to resolve the dispute
        const resolveResponse = await resolveDispute({
            contractId,
            disputeResolver,
            approverFunds,
            serviceProviderFunds
        })

        if (!resolveResponse.unsignedTransaction) {
            return NextResponse.json(
                { error: 'Failed to resolve dispute' },
                { status: 500 }
            )
        }

        // 2. Update the dispute in the database
        const { data: updatedDispute, error } = await supabase
            .from('escrow_disputes')
            .update({ 
                status: 'resolved',
                resolution,
                mediator: disputeResolver,
                resolved_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()
            
        if (error) {
            return NextResponse.json(
                { error: 'Failed to update dispute' },
                { status: 500 }
            )
        }
        
        // 3. Get the escrow ID to update the contract
        const { data: dispute } = await supabase
            .from('escrow_disputes')
            .select('escrow_id')
            .eq('id', id)
            .single()
            
        if (dispute) {
            // 4. Check if there are any other active disputes for this escrow
            const { data: activeDisputes } = await supabase
                .from('escrow_disputes')
                .select('id')
                .eq('escrow_id', dispute.escrow_id)
                .neq('status', 'resolved')
                .neq('status', 'rejected')
                
            // 5. If no other active disputes, update the escrow contract
            if (!activeDisputes || activeDisputes.length === 0) {
                await supabase
                    .from('escrow_contracts')
                    .update({ dispute_flag: false })
                    .eq('id', dispute.escrow_id)
            }
        }
        
        return NextResponse.json({
            status: 'success',
            dispute: updatedDispute,
            unsignedTransaction: resolveResponse.unsignedTransaction
        })
    } catch (error) {
        console.error('Error resolving dispute:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
