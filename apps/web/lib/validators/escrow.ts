import type {
	EscrowFundData,
	EscrowFundUpdateData,
	EscrowPayload,
} from '../types/escrow/escrow-payload.types'
import type { Milestone } from '../types/escrow/escrow.types'

interface ValidationResult {
	success: boolean
	errors: string[]
}

const validateMilestone = (milestone: Milestone, index: number): string[] => {
	const errors: string[] = []
	// const now = new Date()

	if (!milestone.description?.trim()) {
		errors.push(`Milestone ${index + 1}: Title is required`)
	}
	if (!milestone.description?.trim()) {
		errors.push(`Milestone ${index + 1}: Description is required`)
	}
	// if (typeof milestone.amount !== 'number' || milestone.amount <= 0) {
	// 	errors.push(`Milestone ${index + 1}: Amount must be a positive number`)
	// }
	// if (!Date.parse(milestone.dueDate.toString())) {
	// 	errors.push(`Milestone ${index + 1}: Invalid due date`)
	// }

	return errors
}

export function validateEscrowInitialization(
	data: EscrowPayload,
): ValidationResult {
	const errors: string[] = []

	// Validate parties
	if (!data.approver || !data.serviceProvider) {
		errors.push('Parties object is required')
	} else {
		if (!data.serviceProvider?.trim()) {
			errors.push('Payer address is required')
		}
		if (!data.approver?.trim()) {
			errors.push('Receiver address is required')
		}
		// if (!Array.isArray(parties.reviewers) || parties.reviewers.length === 0) {
		//   errors.push("At least one reviewer is required");
	}

	// Validate milestones
	if (!Array.isArray(data.milestones) || data.milestones.length === 0) {
		errors.push('At least one milestone is required')
	} else {
		data.milestones.forEach((milestone, index) => {
			errors.push(...validateMilestone(milestone, index))
		})
	}

	// Validate platform fee
	if (
		typeof data.platformFee !== 'number' ||
		data.platformFee < 0 ||
		data.platformFee > 100
	) {
		errors.push('Platform fee must be a percentage between 0 and 100')
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
		errors.push('Engagement type is required')
	}

	return {
		success: errors.length === 0,
		errors,
	}
}

export function validateEscrowFunding(data: EscrowFundData): ValidationResult {
	const errors: string[] = []

	if (!data.signer) {
		errors.push('Signer required')
	}

	// Validate fundParams object
	if (!data.fundParams) {
		errors.push('Funding parameters are required.')
	} else {
		if (!data.fundParams.userId?.trim()) {
			errors.push('User ID is required.')
		}
		if (
			!data.fundParams.amount ||
			Number.isNaN(Number(data.fundParams.amount)) ||
			Number(data.fundParams.amount) <= 0
		) {
			errors.push('Amount must be a positive number.')
		}
		if (!data.fundParams.transactionType) {
			errors.push('Transaction type is required.')
		} else if (
			!['DEPOSIT', 'RELEASE', 'REFUND', 'DISPUTE', 'FEE'].includes(
				data.fundParams.transactionType,
			)
		) {
			errors.push('Invalid transaction type.')
		}

		if (!data.fundParams.escrowContract) {
			errors.push('Escrow contract is required')
		}
	}

	// Validate metadata object
	if (!data.metadata) {
		errors.push('Metadata is required.')
	} else {
		if (!data.metadata.escrowId?.trim()) {
			errors.push('Escrow ID is required.')
		}
		if (!data.metadata.payerAddress?.trim()) {
			errors.push('Payer address is required.')
		}

		// Ensure required fields based on transaction type
		if (
			data.fundParams.transactionType === 'RELEASE' &&
			!data.metadata.recipientAddress?.trim()
		) {
			errors.push('Recipient address is required for RELEASE transactions.')
		}
		if (
			['DISPUTE', 'REFUND'].includes(data.fundParams.transactionType) &&
			!data.metadata.reason?.trim()
		) {
			errors.push(
				`Reason is required for ${data.fundParams.transactionType} transactions.`,
			)
		}
		if (
			data.fundParams.transactionType === 'FEE' &&
			(!data.metadata.feeAmount ||
				Number.isNaN(Number(data.metadata.feeAmount)) ||
				Number(data.metadata.feeAmount) <= 0)
		) {
			errors.push('Valid fee amount is required for FEE transactions.')
		}
	}

	return {
		success: errors.length === 0,
		errors,
	}
}

export function validateEscrowFundUpdate(
	data: EscrowFundUpdateData,
): ValidationResult {
	const errors: string[] = []

	// Validate escrowId
	if (!data.escrowId?.trim()) {
		errors.push('Escrow ID is required.')
	}

	// Validate transactionHash
	if (!data.transactionHash?.trim()) {
		errors.push('Transaction hash is required.')
	}

	// Validate status
	if (!data.status) {
		errors.push('Transaction status is required.')
	} else if (!['PENDING', 'SUCCESSFUL', 'FAILED'].includes(data.status)) {
		errors.push('Invalid transaction status.')
	}

	return {
		success: errors.length === 0,
		errors,
	}
}
