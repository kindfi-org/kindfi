import type { AuthenticationResponseJSON } from '@simplewebauthn/browser'
import type {
	Memo,
	MemoType,
	Operation,
	Transaction,
} from '@stellar/stellar-sdk'

export type SignParams = {
	signRes: AuthenticationResponseJSON
	authTxn: Transaction<Memo<MemoType>, Operation[]>
	lastLedger: number
}

export type PresignResponse = {
	authTxn: Transaction<Memo<MemoType>, Operation[]>
	base64urlAuthHash: string
	lastLedger: number
}
