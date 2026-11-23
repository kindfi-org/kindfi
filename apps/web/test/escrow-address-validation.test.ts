import { describe, expect, test } from 'bun:test'
import { StrKey } from '@stellar/stellar-sdk'
import type { InitializeSingleReleaseEscrowPayload } from '@trustless-work/escrow'
import { saveEscrowContractInputSchema } from '~/lib/schemas/server-actions.schemas'
import { KINDFI_PLATFORM_FEE_PERCENT } from '~/lib/utils/escrow/platform-fee'
import { assertClassicEscrowPayloadAddresses } from '~/lib/utils/escrow/validate-escrow-addresses'

const account = StrKey.encodeEd25519PublicKey(new Uint8Array(32).fill(3))
const contract = StrKey.encodeContract(new Uint8Array(32).fill(7))

const validInput = () => ({
	projectId: '00000000-0000-4000-8000-000000000001',
	contractId: contract,
	escrowData: {
		engagementId: 'project-1',
		title: 'Project escrow',
		description: 'Funds for project work',
		roles: {
			approver: account,
			serviceProvider: account,
			disputeResolver: account,
			platformAddress: account,
			releaseSigner: account,
		},
		platformFee: KINDFI_PLATFORM_FEE_PERCENT,
		amount: 10,
		receiver: account,
	},
})

describe('escrow creation address validation', () => {
	test('accepts classic account roles and payout address', () => {
		expect(saveEscrowContractInputSchema.safeParse(validInput()).success).toBe(true)
	})

	test('rejects a contract payout address with a clear message', () => {
		const input = validInput()
		input.escrowData.receiver = contract
		const result = saveEscrowContractInputSchema.safeParse(input)
		expect(result.success).toBe(false)
		if (!result.success) {
			expect(
				result.error.issues.some((issue) =>
					issue.message.includes('payout address must be a classic'),
				),
			).toBe(true)
		}
	})

	test('rejects a contract signer and truncated payout address', () => {
		const input = validInput()
		input.escrowData.roles.releaseSigner = contract
		input.escrowData.receiver = account.slice(0, -1)
		expect(saveEscrowContractInputSchema.safeParse(input).success).toBe(false)
	})

	test('stops a contract payout before requesting escrow deployment', () => {
		const payload: InitializeSingleReleaseEscrowPayload = {
			signer: account,
			engagementId: 'project-1',
			title: 'Project escrow',
			roles: {
				approver: account,
				serviceProvider: account,
				platformAddress: account,
				releaseSigner: account,
				disputeResolver: account,
				receiver: contract,
			},
			description: 'Funds for project work',
			amount: 10,
			platformFee: KINDFI_PLATFORM_FEE_PERCENT,
			trustline: { address: contract, symbol: 'USDC' },
			milestones: [{ description: 'First release' }],
		}

		expect(() => assertClassicEscrowPayloadAddresses(payload)).toThrow(
			'The payout address must be a classic Stellar account',
		)
	})
})
