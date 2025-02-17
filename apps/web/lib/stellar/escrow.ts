import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  default as Predicate,
  TransactionBuilder,
  type xdr,
  nativeToScVal,
  Contract,
  rpc,
} from "@stellar/stellar-sdk";
import { AppError } from "../error";
import type { EscrowContractParams } from "../types/escrow.types";
import { getAccountSequence } from "../utils";
import { generateUniqueId } from "../utils/id";
import { submitTransaction } from "./horizon";

interface EscrowContractResult {
  success: boolean;
  contractAddress?: string;
  engagementId?: string;
  contributionId?: string;
  totalAmount?: number;
  error?: string;
}

const networkPassphrase = Networks.TESTNET;

export async function initializeEscrowContract(
  params: EscrowContractParams & {
    parties: { payer: string; receiver: string };
  },
  secretKey: string
): Promise<EscrowContractResult> {
  try {
    // Calculate total amount including all milestones
    const totalAmount = params.milestones.reduce(
      (sum, milestone) => sum + milestone.amount,
      0
    );

    // Generate unique IDs
    const engagementId = generateUniqueId();
    const contributionId = generateUniqueId();

    // Initialize contract on Stellar
    const payerAccount = new Account(
      Keypair.fromSecret(params.parties.payer).publicKey(),
      getAccountSequence(params.parties.payer).toString()
    );
    const transaction = new TransactionBuilder(payerAccount, {
      fee: "100",
      networkPassphrase, // or MAINNET for production
    })
      .addOperation(
        Operation.createClaimableBalance({
          amount: totalAmount.toString(),
          asset: Asset.native(),
          claimants: [
            {
              destination: params.parties.receiver,
              predicate: Predicate.and([
                Predicate.beforeRelativeTime("12096000"), // 140 days
                Predicate.not(Predicate.beforeAbsoluteTime("0")),
              ]),
              toXDRObject: (): xdr.Claimant => {
                throw new Error("Function not implemented.");
              },
            },
          ],
        })
      )
      .setTimeout(30)
      .build();

    // Sign the transaction
    transaction.sign(Keypair.fromSecret(secretKey));

    const result = await submitTransaction(transaction);

    return {
      success: true,
      contractAddress: result.hash,
      engagementId,
      contributionId,
      totalAmount,
    };
  } catch (error) {
    console.error("Failed to initialize escrow contract:", error);
    throw new AppError(
      error instanceof Error ? error.message : "Unknown error occurred",
      500,
      error
    );
  }
}

export async function createEscrowTransferTransaction(
  source: string,
  destination: string,
  amount: number,
  asset: string
) {
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  const server = new rpc.Server(process.env.NEXT_PUBLIC_STELLAR_NETWORK_URL!);
  const sourceAccount = await server.getAccount(source);

  const transaction = new TransactionBuilder(sourceAccount, {
    networkPassphrase,
    fee: "1000",
  });

  const [assetCode, assetIssuer] = asset.split(":");
  const contractId = new Asset(assetCode, assetIssuer).contractId(
    networkPassphrase
  );
  const contract = new Contract(contractId);

  const transferOp = contract.call(
    "transfer",
    nativeToScVal(source, { type: "address" }),
    nativeToScVal(destination, { type: "address" }),
    nativeToScVal(amount, { type: "i128" })
  );
  transaction.addOperation(transferOp);

  const builtTransaction = transaction.setTimeout(300).build();

  // Simulate the transaction
  const simulatedTx = await server.prepareTransaction(builtTransaction);

  return {
    transaction: simulatedTx.toXDR(),
    network_passphrase: networkPassphrase,
  };
}
