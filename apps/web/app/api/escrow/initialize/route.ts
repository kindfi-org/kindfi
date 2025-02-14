import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import http from "~/lib/axios/http";
import { AppError } from "~/lib/error";
import { initializeEscrowContract } from "~/lib/stellar/escrow";
import type { EscrowInitialization } from "~/lib/types";
import { validateEscrowInitialization } from "~/lib/validators/escrow";
import axios from "axios";

const supabase = createClient(
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const initializationData: EscrowInitialization = await req.json();
    const validationResult = validateEscrowInitialization(initializationData);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid escrow initialization",
          details: validationResult.errors,
        },
        { status: 400 }
      );
    }

    const contractResult = await initializeEscrowContract(
      initializationData.contractParams,
      initializationData.contractParams.parties.payer
      // TODO: Check this initializationData.contractParams.parties.payerSecretKey it seems to be missing, changing to payer in the meantime
    );

    if (!contractResult.success) {
      return NextResponse.json(
        {
          error: "Failed to initialize escrow contract",
          details: contractResult.error,
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
        receiver_address: initializationData.contractParams.parties.receiver,
        amount: contractResult.totalAmount,
        platform_fee: initializationData.contractParams.platformFee,
        current_state: "PENDING",
        metadata: initializationData.metadata,
      })
      .select("id")
      .single();

    if (dbError) {
      return NextResponse.json(
        {
          error: "Failed to track escrow contract",
          details: dbError,
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
        status: "INITIALIZED",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      console.error("Escrow initialization error:", error);
      return NextResponse.json(
        {
          error: (error as AppError).message,
          details: (error as AppError).details, // Include additional details for troubleshooting
        },
        { status: (error as AppError).statusCode }
      );
    }

    console.error("Internal server error during escrow initialization:", error);
    return NextResponse.json(
      {
        error: "Internal server error during escrow initialization",
      },
      { status: 500 }
    );
  }
}

const initializeEscrow = async (payload: EscrowInitialization) => {
  try {
    const response = await http.post(
      "/deployer/invoke-deployer-contract",
      payload
    );

    const { unsignedTransaction } = response.data;

    // Use the utility function to sign the transaction
    // const signedTxXdr = signTransaction(unsignedTransaction)

    const signedTxXdr = "signedTxXdr";

    const tx = await http.post("/helper/send-transaction", {
      signedXdr: signedTxXdr,
      returnValueIsRequired: true,
    });

    const { data } = tx;

    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || "Error initializing escrow"
      );
    } else {
      console.error("Unexpected Error:", error);
      throw new Error("Unexpected error occurred");
    }
  }
};
