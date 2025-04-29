import { NextRequest, NextResponse } from 'next/server'
import { addEvidence } from '~/lib/services/escrow-dispute.service'
import { addEvidenceValidator } from '~/lib/constants/escrow/dispute.validator'
import { supabase } from '~/lib/supabase/client'

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await req.json()
        
        // Validate using zod
        const validationResult = addEvidenceValidator.safeParse({
            ...body,
            escrowId: id
        })
        
        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Invalid evidence data', 
                    details: validationResult.error.errors 
                },
                { status: 400 }
            )
        }

        const { evidenceUrl, description, submittedBy } = validationResult.data
        
        // Add evidence to the dispute
        const evidence = await addEvidence({
            disputeId: id,
            evidenceUrl,
            description,
            submittedBy
        })
        
        return NextResponse.json({
            status: 'success',
            evidence
        })
    } catch (error) {
        console.error('Error adding evidence:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        
        // Get all evidence for the dispute
        const { data: evidences, error } = await supabase
            .from('escrow_dispute_evidences')
            .select('*')
            .eq('escrow_dispute_id', id)
            
        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch evidence' },
                { status: 500 }
            )
        }
        
        return NextResponse.json({
            status: 'success',
            evidences
        })
    } catch (error) {
        console.error('Error fetching evidence:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
