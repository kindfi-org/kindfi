import type {
  EscrowFundData,
  EscrowInitialization,
  Milestone,
} from "../types/escrow.types";

interface ValidationResult {
  success: boolean;
  errors: string[];
}

const validateMilestone = (milestone: Milestone, index: number): string[] => {
  const errors: string[] = [];

  if (!milestone.title?.trim()) {
    errors.push(`Milestone ${index + 1}: Title is required`);
  }
  if (!milestone.description?.trim()) {
    errors.push(`Milestone ${index + 1}: Description is required`);
  }
  if (typeof milestone.amount !== "number" || milestone.amount <= 0) {
    errors.push(`Milestone ${index + 1}: Amount must be a positive number`);
  }
  if (!Date.parse(milestone.dueDate.toString())) {
    errors.push(`Milestone ${index + 1}: Invalid due date`);
  }

  return errors;
};

export function validateEscrowInitialization(
  data: EscrowInitialization
): ValidationResult {
  const errors: string[] = [];

  // Validate contract parameters
  if (!data.contractParams) {
    errors.push("Contract parameters are required");
    return { success: false, errors };
  }

  // Validate parties
  if (!data.contractParams.parties) {
    errors.push("Parties object is required");
  } else {
    const { parties } = data.contractParams;
    if (!parties.payer?.trim()) {
      errors.push("Payer address is required");
    }
    if (!parties.receiver?.trim()) {
      errors.push("Receiver address is required");
    }
    if (!Array.isArray(parties.reviewers) || parties.reviewers.length === 0) {
      errors.push("At least one reviewer is required");
    }
  }

  // Validate milestones
  if (
    !Array.isArray(data.contractParams.milestones) ||
    data.contractParams.milestones.length === 0
  ) {
    errors.push("At least one milestone is required");
  } else {
    data.contractParams.milestones.forEach((milestone, index) => {
      errors.push(...validateMilestone(milestone, index));
    });
  }

  // Validate platform fee
  if (
    typeof data.contractParams.platformFee !== "number" ||
    data.contractParams.platformFee < 0 ||
    data.contractParams.platformFee > 100
  ) {
    errors.push("Platform fee must be a percentage between 0 and 100");
  }

  // Validate metadata exists
  if (!data.metadata) {
    errors.push("Metadata is required");
    return { success: false, errors };
  }

  // Validate metadata fields
  if (!data.metadata.projectId?.trim()) {
    errors.push("Project ID is required");
  }
  if (!data.metadata.engagementType?.trim()) {
    errors.push("Engagement type is required");
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

export function validateEscrowFunding(data: EscrowFundData): ValidationResult {
  const errors: string[] = [];

  // Validate fundParams object
  if (!data.fundParams) {
    errors.push("Funding parameters are required.");
  } else {
    if (!data.fundParams.userId?.trim()) {
      errors.push("User ID is required.");
    }
    if (!data.fundParams.stellarTransactionHash?.trim()) {
      errors.push("Stellar transaction hash is required.");
    }
    if (
      !data.fundParams.amount ||
      Number.isNaN(Number(data.fundParams.amount)) ||
      Number(data.fundParams.amount) <= 0
    ) {
      errors.push("Amount must be a positive number.");
    }
    if (!data.fundParams.transactionType) {
      errors.push("Transaction type is required.");
    } else if (
      !["DEPOSIT", "RELEASE", "REFUND", "DISPUTE", "FEE"].includes(
        data.fundParams.transactionType
      )
    ) {
      errors.push("Invalid transaction type.");
    }
  }

  // Validate metadata object
  if (!data.metadata) {
    errors.push("Metadata is required.");
  } else {
    if (!data.metadata.escrowId?.trim()) {
      errors.push("Escrow ID is required.");
    }
    if (!data.metadata.payerAddress?.trim()) {
      errors.push("Payer address is required.");
    }

    // Ensure required fields based on transaction type
    if (
      data.fundParams.transactionType === "RELEASE" &&
      !data.metadata.recipientAddress?.trim()
    ) {
      errors.push("Recipient address is required for RELEASE transactions.");
    }
    if (
      ["DISPUTE", "REFUND"].includes(data.fundParams.transactionType) &&
      !data.metadata.reason?.trim()
    ) {
      errors.push(
        `Reason is required for ${data.fundParams.transactionType} transactions.`
      );
    }
    if (
      data.fundParams.transactionType === "FEE" &&
      (!data.metadata.feeAmount ||
        Number.isNaN(Number(data.metadata.feeAmount)) ||
        Number(data.metadata.feeAmount) <= 0)
    ) {
      errors.push("Valid fee amount is required for FEE transactions.");
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
