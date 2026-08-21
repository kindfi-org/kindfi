import type { Asset, Memo, MemoType } from '@stellar/stellar-sdk'

export type WalletSendAssetCode = 'XLM' | 'USDC'

export type WalletSendMemoInput =
	| { type: 'none' }
	| { type: Extract<MemoType, 'text'>; value: string }
	| { type: Extract<MemoType, 'id'>; value: string }

export type WalletSendFormInput = {
	asset: WalletSendAssetCode
	destination: string
	amount: string
	memo: WalletSendMemoInput
}

export type ValidatedWalletSendPayment = {
	destination: string
	amount: string
	memo: WalletSendMemoInput
	asset: WalletSendAssetCode
	paymentAsset: Asset
	memoObject?: Memo
}

export type HorizonAccountBalanceLine = {
	balance: string
	buying_liabilities?: string
	selling_liabilities?: string
	asset_type: string
	asset_code?: string
	asset_issuer?: string
	limit?: string
	is_authorized?: boolean
	is_authorized_to_maintain_liabilities?: boolean
}

export type HorizonAccountResponse = {
	id: string
	account_id: string
	sequence: string
	subentry_count: number
	balances: HorizonAccountBalanceLine[]
}
