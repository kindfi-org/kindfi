import { useState, useCallback, useEffect } from "react";
import { Horizon, Networks } from "@stellar/stellar-sdk";
import { createEscrowRequest } from "~/lib/stellar/utils/create-escrow";
import { sendTransaction } from "~/lib/stellar/utils/send-transaction";
import { signTransaction } from "~/lib/stellar/utils/sign-transaction";

interface FundingParams {
  escrowContract: string;
  escrowId: string;
  amount: number;
  payerAddress: string;
  signer: string;
}

export const useEscrowFunding = ({ escrowContract, escrowId, amount, payerAddress, signer }: FundingParams) => {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed" | "error">("idle");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendPayment = useCallback(async () => {
    try {

      /* 1. Create the escrow contract through the initialize escrow - Trustless Work API
      - The Trustless Work API will return an unsigned transaction XDR	
      */
      const responseFundEscrowRequest = await createEscrowRequest({
        action: 'fund',
        method: 'POST',
        data: {
          "signer": signer,
          "contractId": escrowContract
        },
      })

      // Get the unsigned transaction XDR
      const { unsignedTransaction } = responseFundEscrowRequest;

      if (!unsignedTransaction) {
        throw Error("")
      }

      // 3. Sign the transaction
      // todo: HERE YOU HAVE TO CREATE A FUNCTION TO SIGN THE TRANSACTION
      // const signedTransaction = await signTransaction(unsignedTransaction);
      // const signedTxXdr = unsignedTransaction

      const signedTxXdr = signTransaction(unsignedTransaction, Networks.TESTNET, signer);

      // 4. Send the signed transaction to the Stellar network through the send transaction - Trustless Work API
      const txResponse = await sendTransaction(signedTxXdr || '')

      setTransactionHash(txResponse.txHash);

      // Call the Next.js API to update the database
      const response = await fetch("/api/escrow/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundParams: {
            userId: payerAddress,
            stellarTransactionHash: txResponse.txHash,
            amount: amount.toString(),
            transactionType: "DEPOSIT",
          },
          metadata: {
            escrowId,
            payerAddress,
            createdAt: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to track funding transaction");
      setStatus("pending");
    } catch (error) {
      console.error("Failed to send funding transaction:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      setStatus("error");
    }
  }, [signer, escrowId, escrowContract, amount, payerAddress]);


  const checkStatus = useCallback(async () => {
    if (transactionHash) {
      const response = await fetchTransactionStatus(transactionHash);
      if (response.successful) {
        setStatus("success");

        // Call webhook to notify funding success
        await fetch(`/api/escrow/fund/${transactionHash}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            escrowId,
            transactionHash: transactionHash,
            status: "SUCCESSFUL",
          }),
        });

      } else {
        setStatus("failed");

        // Call webhook to notify funding failure
        await fetch(`/api/escrow/fund/${transactionHash}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            escrowId,
            transactionHash: transactionHash,
            status: "FAILED",
          }),
        });
      }
    }
  }, [escrowId, transactionHash]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [checkStatus]);

  return { sendPayment, status, transactionHash, error };
};

export async function fetchTransactionStatus(hash: string) {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const server = new Horizon.Server(process.env.STELLAR_NETWORK_URL!);
  const response = await server.transactions().transaction(hash).call();
  return response;
}