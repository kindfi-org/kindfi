import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateEscrowInitialization } from "~/lib/validators/escrow";
import { initializeEscrowContract } from "~/lib/stellar/escrow";
import type { EscrowInitialization } from "~/lib/types/escrow";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const initializationData: EscrowInitialization = await req.json();
        const validationResult =
            validateEscrowInitialization(initializationData);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: "Invalid escrow initialization",
                    details: validationResult.errors
                },
                { status: 400 }
            );
        }

        const contractResult = await initializeEscrowContract(
            initializationData.contractParams
        );

        if (!contractResult.success) {
            return NextResponse.json(
                {
                    error: "Failed to initialize escrow contract",
                    details: contractResult.error
                },
                { status: 500 }
            );
        }

        const { data: dbResult, error: dbError } = await supabase
            .from("escrow_contracts")
            .insert({
                engagement_id: contractResult.engagementId,
                contract_id: contractResult.contractAddress,
                project_id: initializationData.metadata.projectId,
                contribution_id: contractResult.contributionId,
                payer_address: initializationData.contractParams.parties.payer,
                receiver_address:
                    initializationData.contractParams.parties.receiver,
                amount: contractResult.totalAmount,
                platform_fee: initializationData.contractParams.platformFee,
                current_state: "NEW",
                metadata: initializationData.metadata
            })
            .select("id")
            .single();

        if (dbError) {
            await rollbackEscrowContract(contractResult.contractAddress);
            return NextResponse.json(
                {
                    error: "Failed to track escrow contract",
                    details: dbError
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                escrowId: dbResult.id,
                contractAddress: contractResult.contractAddress,
                status: "INITIALIZED"
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Escrow initialization error:", error);
        return NextResponse.json(
            {
                error: "Internal server error during escrow initialization"
            },
            { status: 500 }
        );
    }
}
