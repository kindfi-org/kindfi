import type { AuthenticationResponseJSON } from '@simplewebauthn/browser'
import type { Transaction } from '@stellar/stellar-sdk'

export type SignParams = {
	signRes: AuthenticationResponseJSON
	authTxn: Transaction
	lastLedger: number
}

export type PresignResponse = {
	authTxn: Transaction
	base64urlAuthHash: string
	lastLedger: number
}
