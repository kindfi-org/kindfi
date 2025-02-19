import type { Status } from '../utils.types'
import type { EscrowPayload } from './escrow-payload.types'

// Escrow's Response
export type EscrowRequestResponse = {
	status: Status
	unsignedTransaction?: string
}

export type InitializeEscrowResponse = {
	contract_id: string
	escrow: EscrowPayload
	message: string
	status: Status
}

export type FundEscrowResponse = {
	message: string
	status: Status
}

export type SendTransactionResponse = InitializeEscrowResponse &
	FundEscrowResponse
