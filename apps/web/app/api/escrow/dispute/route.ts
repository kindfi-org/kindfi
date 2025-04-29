import { NextRequest, NextResponse } from 'next/server';
import {
    startDispute,
    createDisputeRecord,
} from '~/lib/services/escrow-dispute.service';
import { startDisputeValidator } from '~/lib/constants/escrow/dispute.validator';
import { createClient } from '~/lib/supabase/client';

export async function POST(req: NextRequest) {
    try {
        // Parse and validate the request body
        const body = await req.json();

        // Validate using zod
        const validationResult = startDisputeValidator.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid dispute data',
                    details: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        const { contractId, signer, reason, evidenceUrls } =
            validationResult.data;

        // 1. Call the Trustless Work API to start the dispute
        const disputeResponse = await startDispute({
            contractId,
            signer,
        });

        if (!disputeResponse.unsignedTransaction) {
            return NextResponse.json(
                { error: 'Failed to start dispute' },
                { status: 500 }
            );
        }

        // 2. Get the escrow contract ID from the database
        const supabase = createClient();
        const { data: escrowContract } = await supabase
            .from('escrow_contracts')
            .select('id')
            .eq('contract_id', contractId)
            .single();

        if (!escrowContract) {
            return NextResponse.json(
                { error: 'Escrow contract not found' },
                { status: 404 }
            );
        }

        // 3. Create a dispute record in the database
        const dispute = await createDisputeRecord({
            escrowId: escrowContract.id,
            reason,
            initiator: signer,
            evidenceUrls,
        });

        // 4. Update the escrow contract with dispute flag
        await createClient()
            .from('escrow_contracts')
            .update({ dispute_flag: true })
            .eq('id', escrowContract.id);

        // 5. Return the response
        return NextResponse.json({
            status: 'success',
            dispute: {
                id: dispute.id,
                status: dispute.status,
                reason: dispute.reason,
            },
            unsignedTransaction: disputeResponse.unsignedTransaction,
        });
    } catch (error) {
        console.error('Error starting dispute:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const escrowId = searchParams.get('escrowId');

        if (!escrowId) {
            return NextResponse.json(
                { error: 'Escrow ID is required' },
                { status: 400 }
            );
        }

        // Get disputes for the escrow
        const supabase = createClient();
        const { data: disputes, error } = await supabase
            .from('escrow_disputes')
            .select('*')
            .eq('escrow_id', escrowId);

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch disputes' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: 'success',
            disputes,
        });
    } catch (error) {
        console.error('Error fetching disputes:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
