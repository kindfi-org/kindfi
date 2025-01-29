import { TransactionBuilder, Networks, Operation, Asset, Predicate } from "stellar-sdk";
import type { EscrowContractParams } from "../types/escrow";
import { generateUniqueId } from "../utils/id";

interface EscrowContractResult {
    success: boolean;
    contractAddress?: string;
    engagementId?: string;
    contributionId?: string;
    totalAmount?: number;
    error?: string;
}

export async function initializeEscrowContract(
    params: EscrowContractParams
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

        return {
            success: true,
            contractAddress: transaction.hash().toString("hex"),
            engagementId,
            contributionId,
            totalAmount
        };
    } catch (error) {
        console.error("Failed to initialize escrow contract:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred"
        };
    }
}