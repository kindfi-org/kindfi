import { describe, expect, test } from 'bun:test'
import { Buffer } from 'node:buffer'
import { argsToScVals } from '../src/stellar/passkey-transaction.utils'

describe('argsToScVals', () => {
	test('converts a string to scvString', () => {
		const [val] = argsToScVals(['hello'])
		expect(val.type).toBe('scvString')
		expect(val.type === 'scvString' ? val.str.toString() : null).toBe('hello')
	})

	test('converts a number to scvU64', () => {
		const [val] = argsToScVals([42])
		expect(val.type).toBe('scvU64')
		expect(val.type === 'scvU64' ? val.u64.toString() : null).toBe('42')
	})

	test('converts a boolean to scvBool', () => {
		const [val] = argsToScVals([true])
		expect(val.type).toBe('scvBool')
		expect(val.type === 'scvBool' ? val.b : null).toBe(true)
	})

	test('converts an object to scvBytes with JSON payload', () => {
		const obj = { foo: 'bar' }
		const [val] = argsToScVals([obj])
		expect(val.type).toBe('scvBytes')
		expect(
			val.type === 'scvBytes' ? Buffer.from(val.bytes.toBytes()).toString('utf-8') : null,
		).toBe(JSON.stringify(obj))
	})

	test('preserves order and length across mixed args', () => {
		const vals = argsToScVals(['a', 1, false])
		expect(vals).toHaveLength(3)
		expect(vals[0].type).toBe('scvString')
		expect(vals[1].type).toBe('scvU64')
		expect(vals[2].type).toBe('scvBool')
	})

	test('returns an empty array for no args', () => {
		expect(argsToScVals([])).toEqual([])
	})
})
