import { describe, expect, test } from 'bun:test'
import { StrKey } from '@stellar/stellar-sdk'
import { isClassicAccountAddress, isContractAddress } from '../src/utils/wallet-address'

const classic = StrKey.encodeEd25519PublicKey(new Uint8Array(32).fill(3))
const contract = StrKey.encodeContract(new Uint8Array(32).fill(7))

describe('Stellar address kinds', () => {
	test('accepts only checksum-valid G-addresses as classic accounts', () => {
		expect(isClassicAccountAddress(classic)).toBe(true)
		expect(isClassicAccountAddress(contract)).toBe(false)
		expect(isClassicAccountAddress(classic.slice(0, -1))).toBe(false)
		expect(isClassicAccountAddress(`${classic.slice(0, -1)}A`)).toBe(false)
	})

	test('accepts only checksum-valid C-addresses as contracts', () => {
		expect(isContractAddress(contract)).toBe(true)
		expect(isContractAddress(classic)).toBe(false)
		expect(isContractAddress(contract.slice(0, -1))).toBe(false)
	})
})
