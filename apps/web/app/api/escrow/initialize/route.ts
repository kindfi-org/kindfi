import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { AppError } from "~/lib/error";
import { validateEscrowInitialization } from "~/lib/validators/escrow";
import { sendTransaction } from "~/lib/stellar/utils/send-transaction";
import { createEscrowRequest } from "~/lib/stellar/utils/create-escrow";
import { supabase } from "~/lib/supabase/config";
import { EscrowPayload } from "~/lib/types/escrow/escrow-payload.types";

export async function POST(req: NextRequest) {
  try {
    /* FLOW */
    // 1. Validate the request payload
    // 2. Create the escrow contract through the initialize escrow - Trustless Work API
    // 3. Sign the transaction
    // 4. Send the signed transaction to the Stellar network through the send transaction - Trustless Work API

    const initializationData: EscrowPayload = await req.json();
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

    const responseCreateEscrowRequest = await createEscrowRequest({
      action: "initiate",
      method: "POST",
      data: initializationData,
    });

    const { unsignedTransaction } = responseCreateEscrowRequest;

    // todo: sign transaction
    // const signedTransaction = await signTransaction(unsignedTransaction);
    const signedTxXdr = unsignedTransaction;

    const response = await sendTransaction(signedTxXdr || "");

    if (response) {
      const { data: dbResult, error: dbError } = await supabase
        .from("escrow_contracts")
        .insert({
          engagement_id: response.escrow.engagementId,
          contract_id: response.contract_id,
          amount: response.escrow.amount,
          platform_fee: response.escrow.platformFee,
          current_state: "PENDING",
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
          contractAddress: response.contract_id,
          status: "INITIALIZED",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      console.error("Escrow initialization error:", error);
      return NextResponse.json(
        {
          error: (error as AppError).message,
          details: (error as AppError).details,
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
