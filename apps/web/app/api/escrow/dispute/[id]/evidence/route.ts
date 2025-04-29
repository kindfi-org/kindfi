import { NextRequest, NextResponse } from 'next/server'
import { addEvidence, getEvidenceByDisputeId } from '~/lib/services/escrow-dispute.service'
import { addEvidenceValidator } from '~/lib/constants/escrow/dispute.validator'
import { createClient } from '~/lib/supabase/client'

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
            disputeId: id
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
        
        // Get all evidence for the dispute using the service function
        const evidence = await getEvidenceByDisputeId(id)
        
        // Return the evidence with consistent response structure
        return NextResponse.json({
            status: 'success',
            evidence
        })
    } catch (error) {
        console.error('Error fetching evidence:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
