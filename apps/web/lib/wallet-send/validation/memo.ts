import type { Memo, MemoType } from '@stellar/stellar-sdk'
import { Memo as StellarMemo } from '@stellar/stellar-sdk'
import type { WalletSendMemoInput } from '~/lib/wallet-send/types'

const MEMO_TEXT_MAX_BYTES = 28

export type MemoValidationResult =
	| { ok: true; memo: WalletSendMemoInput; memoObject?: Memo }
	| { ok: false; error: string }

const getUtf8ByteLength = (value: string): number => new TextEncoder().encode(value).length

export const validatePaymentMemo = (input: WalletSendMemoInput): MemoValidationResult => {
	if (input.type === 'none') {
		return { ok: true, memo: input }
	}

	if (input.type === 'text') {
		const value = input.value.trim()
		if (!value) {
			return { ok: false, error: 'Enter memo text or choose no memo.' }
		}

		if (getUtf8ByteLength(value) > MEMO_TEXT_MAX_BYTES) {
			return {
				ok: false,
				error: 'Memo text must be 28 bytes or fewer. Memos are public and stored on the ledger.',
			}
		}

		return {
			ok: true,
			memo: { type: 'text', value },
			memoObject: StellarMemo.text(value),
		}
	}

	const raw = input.value.trim()
	if (!/^\d+$/.test(raw)) {
		return { ok: false, error: 'Memo ID must be a numeric value.' }
	}

	try {
		const memoObject = StellarMemo.id(raw)
		return {
			ok: true,
			memo: { type: 'id' as Extract<MemoType, 'id'>, value: raw },
			memoObject,
		}
	} catch {
		return {
			ok: false,
			error: 'Memo ID must be a valid unsigned 64-bit integer.',
		}
	}
}
