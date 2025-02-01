import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateEscrowInitialization } from "~/lib/validators/escrow";
import { initializeEscrowContract } from "~/lib/stellar/escrow";
import type { EscrowInitialization } from "~/lib/types/escrow";
import { AppError } from "~/lib/errors";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
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
            initializationData.contractParams,
            initializationData.contractParams.parties.payerSecretKey
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
                current_state: "PENDING",
                metadata: initializationData.metadata
            })
            .select("id")
            .single();

        if (dbError) {
            return NextResponse.json(
                {
                    error: "Failed to track escrow contract",
                    details: dbError
                },
                { status: 500 }
            );
        }

        // If successful, update the state to INITIALIZED
        await supabase
            .from("escrow_contracts")
            .update({ current_state: "INITIALIZED" })
            .eq("id", dbResult.id);

        return NextResponse.json(
            {
                escrowId: dbResult.id,
                contractAddress: contractResult.contractAddress,
                status: "INITIALIZED"
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof AppError) {
            console.error("Escrow initialization error:", error);
            return NextResponse.json(
                {
                    error: error.message,
                    details: error.details // Include additional details for troubleshooting
                },
                { status: error.statusCode }
            );
        }

        console.error("Internal server error during escrow initialization:", error);
        return NextResponse.json(
            {
                error: "Internal server error during escrow initialization"
            },
            { status: 500 }
          
        );
    }
}

const initializeEscrow = async (data: EscrowInitialization) => {
    const response = await fetch("/api/escrow/initialize", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json();
        throw {
            error: error.error || "Failed to initialize escrow",
            details: error.details || null
        };
    }

    return response.json();
};
