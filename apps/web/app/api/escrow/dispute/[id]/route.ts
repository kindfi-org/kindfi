import { NextRequest, NextResponse } from 'next/server'
import { getDisputeById, updateDisputeStatus } from '~/lib/services/escrow-dispute.service'
import { updateDisputeStatusValidator } from '~/lib/constants/escrow/dispute.validator'
import { supabase } from '~/lib/supabase/client'

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        
        // Get dispute details
        const dispute = await getDisputeById(id)
        
        if (!dispute) {
            return NextResponse.json(
                { error: 'Dispute not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            status: 'success',
            dispute
        })
    } catch (error) {
        console.error('Error fetching dispute:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await req.json()
        
        // Validate using zod
        const validationResult = updateDisputeStatusValidator.safeParse({
            ...body,
            escrowId: id
        })
        
        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Invalid update data', 
                    details: validationResult.error.errors 
                },
                { status: 400 }
            )
        }

        const { status } = validationResult.data
        
        // Update dispute status
        const updatedDispute = await updateDisputeStatus(id, status)
        
        return NextResponse.json({
            status: 'success',
            dispute: updatedDispute
        })
    } catch (error) {
        console.error('Error updating dispute:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        
        // Check if dispute exists
        const { data: dispute, error: checkError } = await supabase
            .from('escrow_disputes')
            .select('escrow_id')
            .eq('id', id)
            .single()
            
        if (checkError) {
            return NextResponse.json(
                { error: 'Dispute not found' },
                { status: 404 }
            )
        }
        
        // Delete dispute evidences first (due to foreign key constraints)
        await supabase
            .from('escrow_dispute_evidences')
            .delete()
            .eq('escrow_dispute_id', id)
            
        // Delete the dispute
        const { error } = await supabase
            .from('escrow_disputes')
            .delete()
            .eq('id', id)
            
        if (error) {
            return NextResponse.json(
                { error: 'Failed to delete dispute' },
                { status: 500 }
            )
        }
        
        // Update escrow contract dispute flag if no other disputes exist
        const { data: otherDisputes } = await supabase
            .from('escrow_disputes')
            .select('id')
            .eq('escrow_id', dispute.escrow_id)
            
        if (!otherDisputes || otherDisputes.length === 0) {
            await supabase
                .from('escrow_contracts')
                .update({ dispute_flag: false })
                .eq('id', dispute.escrow_id)
        }
        
        return NextResponse.json({
            status: 'success',
            message: 'Dispute deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting dispute:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
