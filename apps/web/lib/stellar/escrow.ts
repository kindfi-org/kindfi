import {
    TransactionBuilder,
    Networks,
    Operation,
    Asset,
    Predicate,
    Server,
    Keypair
} from "stellar-sdk";
import type { EscrowContractParams } from "../types/escrow";
import { generateUniqueId } from "../utils/id";
import { AppError } from "../errors";

interface EscrowContractResult {
    success: boolean;
    contractAddress?: string;
    engagementId?: string;
    contributionId?: string;
    totalAmount?: number;
    error?: string;
}

export async function initializeEscrowContract(
    params: EscrowContractParams,
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
        const transaction = new TransactionBuilder(params.parties.payer, {
            fee: "100",
            networkPassphrase: Networks.TESTNET // or MAINNET for production
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
                                Predicate.not(Predicate.beforeAbsoluteTime("0"))
                            ])
                        }
                    ]
                })
            )
            .setTimeout(30)
            .build();

        // Sign the transaction
        transaction.sign(Keypair.fromSecret(secretKey));

        // Submit the transaction to the Stellar network
        const server = new Server(process.env.STELLAR_NETWORK_URL!); // Set your Stellar network URL
        const result = await server.submitTransaction(transaction);

        return {
            success: true,
            contractAddress: result.hash,
            engagementId,
            contributionId,
            totalAmount
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
