import { EscrowPayload } from "../types/escrow/escrow-payload.types";
import type { Milestone } from "../types/escrow/escrow.types";

interface ValidationResult {
  success: boolean;
  errors: string[];
}

const validateMilestone = (milestone: Milestone, index: number): string[] => {
  const errors: string[] = [];
  // const now = new Date()

  if (!milestone.description?.trim()) {
    errors.push(`Milestone ${index + 1}: Title is required`);
  }
  if (!milestone.description?.trim()) {
    errors.push(`Milestone ${index + 1}: Description is required`);
  }
  // if (typeof milestone.amount !== 'number' || milestone.amount <= 0) {
  // 	errors.push(`Milestone ${index + 1}: Amount must be a positive number`)
  // }
  // if (!Date.parse(milestone.dueDate.toString())) {
  // 	errors.push(`Milestone ${index + 1}: Invalid due date`)
  // }

  return errors;
};

export function validateEscrowInitialization(
  data: EscrowPayload
): ValidationResult {
  const errors: string[] = [];

  // Validate parties
  if (!data.approver || !data.serviceProvider) {
    errors.push("Parties object is required");
  } else {
    if (!data.serviceProvider?.trim()) {
      errors.push("Payer address is required");
    }
    if (!data.approver?.trim()) {
      errors.push("Receiver address is required");
    }
    // if (!Array.isArray(parties.reviewers) || parties.reviewers.length === 0) {
    //   errors.push("At least one reviewer is required");
  }

  // Validate milestones
  if (!Array.isArray(data.milestones) || data.milestones.length === 0) {
    errors.push("At least one milestone is required");
  } else {
    data.milestones.forEach((milestone, index) => {
      errors.push(...validateMilestone(milestone, index));
    });
  }

  // Validate platform fee
  if (
    typeof data.platformFee !== "number" ||
    data.platformFee < 0 ||
    data.platformFee > 100
  ) {
    errors.push("Platform fee must be a percentage between 0 and 100");
  }

  // Validate metadata exists
  //   if (!data.metadata) {
  //     errors.push("Metadata is required");
  //     return { success: false, errors };
  //   }

  // Validate metadata fields
  //   if (!data.metadata.projectId?.trim()) {
  //     errors.push("Project ID is required");
  //   }

  if (!data.engagementId?.trim()) {
    errors.push("Engagement type is required");
  }

  return {
    success: errors.length === 0,
    errors,
  };
}
