import type { EscrowInitialization, Milestone } from "../types/escrow";

interface ValidationResult {
    success: boolean;
    errors: string[];
}

const validateMilestone = (milestone: Milestone, index: number): string[] => {
    const errors: string[] = [];
    const now = new Date();

    if (!milestone.title?.trim()) {
        errors.push(`Milestone ${index + 1}: Title is required`);
    }
    if (!milestone.description?.trim()) {
        errors.push(`Milestone ${index + 1}: Description is required`);
    }
    if (typeof milestone.amount !== "number" || milestone.amount <= 0) {
        errors.push(`Milestone ${index + 1}: Amount must be a positive number`);
    }

    // Enhanced date validation
    let milestoneDate: Date | null = null;
    
    if (milestone.dueDate instanceof Date) {
        milestoneDate = milestone.dueDate;
    } else {
        const parsedDate = Date.parse(String(milestone.dueDate));
        if (!Number.isNaN(parsedDate)) {
            milestoneDate = new Date(parsedDate);
        }
    }

    if (!milestoneDate) {
        errors.push(`Milestone ${index + 1}: Invalid due date`);
    } else {
        // Check if date is in the past
        if (milestoneDate < now) {
            errors.push(`Milestone ${index + 1}: Due date cannot be in the past`);
        }
        
        // Optional: Check if date is too far in the future (e.g., > 2 years)
        const twoYearsFromNow = new Date(now.getFullYear() + 2, now.getMonth(), now.getDate());
        if (milestoneDate > twoYearsFromNow) {
            errors.push(`Milestone ${index + 1}: Due date cannot be more than 2 years in the future`);
        }
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
    }}

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
        errors
    };
}
